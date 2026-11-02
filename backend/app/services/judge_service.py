"""JudgeService: verifica que la respuesta esté respaldada por fuentes aprobadas.

Orden de evaluación:
1. Reglas deterministas (cifras, promesas, simulación de acceso). Sin red, siempre activas.
2. Modelo JUDGE solo si AGENT_JUDGE_ENABLED=true, la respuesta pasó las reglas y contiene
   señales de afirmación (cifras, promesas, superlativos). La salida del modelo se valida con
   Pydantic; JSON inválido equivale a bloqueo (cierre seguro).

Si el veredicto no es aprobado, el orquestador usa la respuesta extractiva aprobada.
"""

import json
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from app.integrations.openrouter_client import (
    ChatMessage,
    CompletionRequest,
    OpenRouterClient,
    OpenRouterError,
)
from app.services.text_guard import has_claim_signal, unsupported_claims

JudgeStatus = Literal[
    "deterministic_pass",
    "deterministic_block",
    "llm_pass",
    "llm_block",
    "llm_invalid",
    "llm_error",
    "skipped",
]


class JudgeVerdict(BaseModel):
    approved: bool
    status: JudgeStatus
    issues: list[str] = Field(default_factory=list)
    model_calls: int = 0
    tokens: int | None = None


class JudgeLLMOutput(BaseModel):
    """Contrato de salida del modelo juez. Campos extra = inválido."""

    model_config = ConfigDict(extra="forbid")
    approved: bool
    issues: list[str] = Field(default_factory=list, max_length=10)


JUDGE_SYSTEM = (
    "Eres un verificador. Recibes una RESPUESTA y las FUENTES aprobadas. Decide si cada "
    "afirmación comercial de la RESPUESTA está respaldada por las FUENTES. Marca como no "
    "aprobado si hay cifras, precios, promesas, garantías, integraciones o acceso a datos reales "
    "que no aparezcan en las FUENTES. Responde SOLO un objeto JSON: "
    '{"approved": true|false, "issues": ["..."]}. Sin texto adicional.'
)


def evaluate_deterministic(answer: str, sources: list[str]) -> JudgeVerdict:
    issues = unsupported_claims(answer, sources)
    if issues:
        return JudgeVerdict(approved=False, status="deterministic_block", issues=issues)
    return JudgeVerdict(approved=True, status="deterministic_pass")


async def evaluate(
    answer: str,
    sources: list[str],
    *,
    client: OpenRouterClient,
    enabled: bool,
    judge_model: str,
    deadline: float | None,
) -> JudgeVerdict:
    deterministic = evaluate_deterministic(answer, sources)
    if not deterministic.approved:
        return deterministic
    if not enabled:
        return JudgeVerdict(approved=True, status="skipped")
    if not has_claim_signal(answer):
        return JudgeVerdict(approved=True, status="skipped")

    context = "\n".join(sources)
    request = CompletionRequest(
        messages=[
            ChatMessage(role="system", content=JUDGE_SYSTEM),
            ChatMessage(
                role="user",
                content=f"FUENTES:\n{context}\n\nRESPUESTA:\n{answer}",
            ),
        ],
        deadline=deadline,
        max_tokens=200,
        model_override=judge_model,
    )
    try:
        result = await client.complete(request)
    except OpenRouterError:
        # El juez no pudo verificar: no se publica la respuesta con afirmaciones sin revisar.
        return JudgeVerdict(
            approved=False, status="llm_error", issues=["juez no disponible"], model_calls=1
        )

    if result.dry_run:
        return JudgeVerdict(approved=True, status="skipped")

    try:
        parsed = JudgeLLMOutput.model_validate(json.loads(_strip_fence(result.text)))
    except (ValueError, ValidationError):
        return JudgeVerdict(
            approved=False,
            status="llm_invalid",
            issues=["salida del juez no válida"],
            model_calls=1,
            tokens=result.tokens,
        )
    if not parsed.approved:
        return JudgeVerdict(
            approved=False,
            status="llm_block",
            issues=parsed.issues or ["juez: afirmación no respaldada"],
            model_calls=1,
            tokens=result.tokens,
        )
    return JudgeVerdict(approved=True, status="llm_pass", model_calls=1, tokens=result.tokens)


def _strip_fence(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.strip("`")
        if stripped.lower().startswith("json"):
            stripped = stripped[4:]
    return stripped.strip()
