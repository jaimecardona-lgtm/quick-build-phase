"""Adaptador de OpenRouter con respaldo ordenado entre modelos.

Con AGENT_DRY_RUN=true (valor por defecto) se usa DryRunOpenRouterClient, que no realiza ninguna
llamada de red. El cliente HTTP acepta un transporte inyectable (httpx.AsyncBaseTransport) para
pruebas con MockTransport. La clave solo se lee del entorno y nunca aparece en logs ni errores.
"""

from typing import Literal, Protocol

import httpx
from pydantic import BaseModel, Field

from app.core.config import Settings

DRY_RUN_MODEL = "dry-run"
DRY_RUN_TEXT = "[DRY-RUN] Respuesta simulada: AGENT_DRY_RUN=true, no se llamó a OpenRouter."
RETRYABLE_STATUS = frozenset({429, 500, 502, 503, 504})


class OpenRouterError(RuntimeError):
    """Error controlado del adaptador. No incluye cuerpos de respuesta ni credenciales."""

    def __init__(self, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.retryable = retryable


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=8000)


class CompletionRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=50)


class CompletionResult(BaseModel):
    text: str
    model: str
    dry_run: bool


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
        models = model_chain(self._settings)
        if not api_key or not models:
            raise OpenRouterError("OpenRouter no está configurado: faltan la clave o el modelo.")

        last_error: OpenRouterError | None = None
        for model in models:
            try:
                return await self._call(api_key, model, request)
            except OpenRouterError as exc:
                last_error = exc
                if not exc.retryable:
                    raise
        raise OpenRouterError(
            "Todos los modelos configurados fallaron.", retryable=True
        ) from last_error

    async def _call(self, api_key: str, model: str, request: CompletionRequest) -> CompletionResult:
        payload = {
            "model": model,
            "messages": [message.model_dump() for message in request.messages],
            "temperature": self._settings.openrouter_temperature,
            "max_tokens": self._settings.openrouter_max_tokens,
        }
        async with httpx.AsyncClient(
            base_url=self._settings.openrouter_api_base,
            timeout=self._settings.openrouter_timeout_seconds,
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
                    "Tiempo de espera agotado con OpenRouter.", retryable=True
                ) from exc
            except httpx.HTTPError as exc:
                raise OpenRouterError(
                    "Error de red al contactar OpenRouter.", retryable=True
                ) from exc

        if response.status_code >= 400:
            raise OpenRouterError(
                f"OpenRouter respondió con HTTP {response.status_code}.",
                retryable=response.status_code in RETRYABLE_STATUS,
            )
        try:
            data = response.json()
            text = data["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise OpenRouterError("Respuesta inesperada de OpenRouter.") from exc
        return CompletionResult(text=text, model=str(data.get("model", model)), dry_run=False)


def build_openrouter_client(
    settings: Settings,
    transport: httpx.AsyncBaseTransport | None = None,
) -> OpenRouterClient:
    if settings.agent_dry_run:
        return DryRunOpenRouterClient()
    return HttpOpenRouterClient(settings, transport=transport)
