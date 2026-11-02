"""Adaptador de OpenRouter con respaldo ordenado entre modelos.

Con AGENT_DRY_RUN=true (valor por defecto) se usa DryRunOpenRouterClient, que no realiza ninguna
llamada de red. El cliente HTTP acepta un transporte inyectable (httpx.AsyncBaseTransport) para
pruebas con MockTransport. La clave solo se lee del entorno y nunca aparece en logs ni errores.

Presupuesto de tiempo: CompletionRequest.deadline (reloj monotónico absoluto) limita el total de
primary + fallback. Cada intento usa como timeout el mínimo entre el timeout por llamada y el
tiempo restante, así una respuesta nunca supera el presupuesto total.
"""

import time
from typing import Literal, Protocol

import httpx
from pydantic import BaseModel, Field

from app.core.config import Settings
from app.core.logging import get_logger

DRY_RUN_MODEL = "dry-run"
DRY_RUN_TEXT = "[DRY-RUN] Respuesta simulada: AGENT_DRY_RUN=true, no se llamó a OpenRouter."
logger = get_logger(__name__)
RETRYABLE_STATUS = frozenset({429, 500, 502, 503, 504})
MIN_ATTEMPT_SECONDS = 1.0


class OpenRouterError(RuntimeError):
    """Error controlado del adaptador. No incluye cuerpos de respuesta ni credenciales.

    `kind` alimenta las métricas de degradación: timeout, quota, network, http, invalid,
    deadline, config.
    """

    def __init__(self, message: str, *, retryable: bool = False, kind: str = "http") -> None:
        super().__init__(message)
        self.retryable = retryable
        self.kind = kind
        # Motivos de los intentos previos cuando falla toda la cadena de modelos.
        self.attempt_errors: list[str] = []


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=8000)


class CompletionRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=50)
    # Instante límite en reloj monotónico (time.monotonic()). None = sin límite adicional.
    deadline: float | None = None
    max_tokens: int | None = Field(default=None, gt=0)
    # Si se indica, se usa solo este modelo (sin fallback). Para Judge y Engagement.
    model_override: str | None = None


class CompletionResult(BaseModel):
    text: str
    model: str
    dry_run: bool
    # Posición en la cadena de modelos: 0 = primary, 1 = fallback.
    attempt: int = 0
    tokens: int | None = None
    # Motivo de cada intento fallido anterior (kinds de OpenRouterError).
    # Vacío si el primario respondió.
    attempt_errors: list[str] = Field(default_factory=list)

    @property
    def fallback_used(self) -> bool:
        return self.attempt > 0


class OpenRouterClient(Protocol):
    async def complete(self, request: CompletionRequest) -> CompletionResult: ...


class DryRunOpenRouterClient:
    """Sin red. El agente responde con su fuente aprobada en lugar de llamar al modelo."""

    async def complete(self, request: CompletionRequest) -> CompletionResult:
        return CompletionResult(text=DRY_RUN_TEXT, model=DRY_RUN_MODEL, dry_run=True)


def model_chain(settings: Settings) -> list[str]:
    """Modelos en orden de preferencia, sin vacíos ni duplicados."""
    seen: list[str] = []
    for model in (settings.openrouter_primary_model, settings.openrouter_fallback_model):
        if model and model not in seen:
            seen.append(model)
    return seen


class HttpOpenRouterClient:
    """Cliente HTTP real. Las pruebas usan un transporte simulado; nunca llaman a la red."""

    def __init__(
        self, settings: Settings, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self._settings = settings
        self._transport = transport

    async def complete(self, request: CompletionRequest) -> CompletionResult:
        api_key = self._settings.openrouter_api_key.get_secret_value()
        models = [request.model_override] if request.model_override else model_chain(self._settings)
        if not api_key or not models:
            raise OpenRouterError(
                "OpenRouter no está configurado: faltan la clave o el modelo.", kind="config"
            )

        last_error: OpenRouterError | None = None
        failures: list[str] = []
        for attempt, model in enumerate(models):
            timeout = self._settings.openrouter_timeout_seconds
            if request.deadline is not None:
                remaining = request.deadline - time.monotonic()
                if remaining < MIN_ATTEMPT_SECONDS:
                    raise OpenRouterError(
                        "Presupuesto de tiempo agotado antes de completar la respuesta.",
                        retryable=True,
                        kind="deadline",
                    )
                timeout = min(timeout, remaining)
            try:
                result = await self._call(api_key, model, request, timeout, attempt)
                return result.model_copy(update={"attempt_errors": failures})
            except OpenRouterError as exc:
                last_error = exc
                failures.append(exc.kind)
                if not exc.retryable:
                    raise
        # Se conserva el motivo real (timeout, quota, network...) para las métricas.
        if last_error is not None:
            last_error.attempt_errors = failures[:-1]
            raise last_error
        raise OpenRouterError("No hay modelos configurados.", kind="config")

    async def _call(
        self,
        api_key: str,
        model: str,
        request: CompletionRequest,
        timeout: float,
        attempt: int,
    ) -> CompletionResult:
        max_tokens = request.max_tokens or self._settings.openrouter_max_tokens
        payload = {
            "model": model,
            "messages": [message.model_dump() for message in request.messages],
            "temperature": self._settings.openrouter_temperature,
            "max_tokens": max_tokens,
        }
        async with httpx.AsyncClient(
            base_url=self._settings.openrouter_api_base,
            timeout=timeout,
            transport=self._transport,
        ) as client:
            try:
                response = await client.post(
                    "chat/completions",
                    json=payload,
                    headers={"Authorization": f"Bearer {api_key}"},
                )
            except httpx.TimeoutException as exc:
                raise OpenRouterError(
                    "Tiempo de espera agotado con OpenRouter.", retryable=True, kind="timeout"
                ) from exc
            except httpx.HTTPError as exc:
                raise OpenRouterError(
                    "Error de red al contactar OpenRouter.", retryable=True, kind="network"
                ) from exc

        if response.status_code >= 400:
            raise OpenRouterError(
                f"OpenRouter respondió con HTTP {response.status_code}.",
                retryable=response.status_code in RETRYABLE_STATUS,
                kind="quota" if response.status_code == 429 else "http",
            )
        try:
            data = response.json()
            text = data["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise OpenRouterError("Respuesta inesperada de OpenRouter.", kind="invalid") from exc
        # Un modelo puede devolver contenido nulo (p. ej. si el límite de tokens
        # se gasta en razonamiento). Es un fallo reintentable: el fallback puede responder.
        if not isinstance(text, str) or not text.strip():
            # Diagnóstico sin contenido: motivo de parada y si el modelo devolvió razonamiento.
            choice = data["choices"][0]
            message = choice.get("message") or {}
            logger.warning(
                "openrouter_empty_content",
                extra={
                    "event": "openrouter_empty_content",
                    "finish_reason": str(choice.get("finish_reason")),
                    "has_reasoning": bool(
                        message.get("reasoning") or message.get("reasoning_content")
                    ),
                    "effective_model": str(data.get("model", model)),
                },
            )
            raise OpenRouterError(
                "OpenRouter devolvió una respuesta vacía.",
                retryable=True,
                kind="empty",
            )
        usage = data.get("usage") if isinstance(data, dict) else None
        tokens = None
        if isinstance(usage, dict) and isinstance(usage.get("total_tokens"), int):
            tokens = usage["total_tokens"]
        return CompletionResult(
            text=text,
            model=str(data.get("model", model)),
            dry_run=False,
            attempt=attempt,
            tokens=tokens,
        )


def build_openrouter_client(
    settings: Settings,
    transport: httpx.AsyncBaseTransport | None = None,
) -> OpenRouterClient:
    if settings.agent_dry_run:
        return DryRunOpenRouterClient()
    return HttpOpenRouterClient(settings, transport=transport)
