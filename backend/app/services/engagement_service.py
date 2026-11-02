"""EngagementService: intención comercial y CTA. No crea prospectos ni guarda datos.

- Reglas deterministas primero. El modelo ENGAGEMENT solo clasifica si
  AGENT_ENGAGEMENT_ENABLED=true y la intención quedó "general".
- Solo recibe el mensaje con correos y teléfonos redactados.
- Diferencia freight forwarders (agentes de carga) de personas que buscan transporte para sí.
- Nunca escribe en la base de datos. Un prospecto solo se crea con consentimiento explícito
  en el flujo de formulario (fuera de este servicio).
"""

import json
import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, ValidationError

from app.integrations.openrouter_client import (
    ChatMessage,
    CompletionRequest,
    OpenRouterClient,
    OpenRouterError,
)
from app.services.text_guard import redact_pii

Intent = Literal["forwarder", "transport_consumer", "demo_interest", "general"]

FORWARDER_RE = re.compile(
    r"\b(freight forwarders?|forwarders?|agentes? de carga|agencias? de carga|despachantes?|"
    r"despacho aduan\w*|agentes? aduan\w*|consolidad\w*|nvocc|customs broker|"
    r"operador(es)? log[ií]stic\w*|agenciamento de carga|despachante aduaneiro)\b",
    re.IGNORECASE,
)
TRANSPORT_CONSUMER_RE = re.compile(
    r"\b(mudanza|mudarme|mudar(me)?|flete para mi|mi carro|mi auto|taxi|uber|pasajeros|"
    r"enviar (un |una )?paquete|encomenda pessoal|mover (mis )?muebles|my car|moving company|"
    r"mudan[çc]a|viajar)\b",
    re.IGNORECASE,
)
DEMO_RE = re.compile(
    r"\b(demo|demostraci\w*|demonstra\w*|agendar|agenda(r)?|reuni\w*|llamada|hablar con|"
    r"cotizar|cotizaci\w*|or[çc]amento|prueba gratis|free trial|trial|quiero probar|"
    r"probar el sistema)\b",
    re.IGNORECASE,
)


class EngagementDecision(BaseModel):
    intent: Intent
    demo_interest: bool
    suggest_cta: bool
    status: Literal["deterministic", "llm", "llm_invalid", "llm_error", "skipped"] = "deterministic"
    model_calls: int = 0
    tokens: int | None = None


class EngagementLLMOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    intent: Literal["forwarder", "transport_consumer", "demo_interest", "general"]
    demo_interest: bool


ENGAGEMENT_SYSTEM = (
    "Clasifica el mensaje de un visitante de un sitio de software logístico. Responde SOLO un "
    'objeto JSON: {"intent": "forwarder"|"transport_consumer"|"demo_interest"|"general", '
    '"demo_interest": true|false}. "forwarder" = agente de carga o empresa logística; '
    '"transport_consumer" = persona que busca transporte para sí misma. Sin texto adicional.'
)


def classify_deterministic(message: str) -> EngagementDecision:
    text = message or ""
    forwarder = bool(FORWARDER_RE.search(text))
    consumer = bool(TRANSPORT_CONSUMER_RE.search(text))
    demo = bool(DEMO_RE.search(text))

    if consumer and not forwarder:
        intent: Intent = "transport_consumer"
    elif forwarder:
        intent = "forwarder"
    elif demo:
        intent = "demo_interest"
    else:
        intent = "general"

    # El CTA se sugiere solo si hay interés explícito o si es un agente de carga (no a
    # personas que buscan transporte).
    suggest = demo or (intent == "forwarder")
    if intent == "transport_consumer" and not demo:
        suggest = False
    return EngagementDecision(intent=intent, demo_interest=demo, suggest_cta=suggest)


async def classify(
    message: str,
    *,
    client: OpenRouterClient,
    enabled: bool,
    engagement_model: str,
    deadline: float | None,
) -> EngagementDecision:
    decision = classify_deterministic(message)
    if not enabled or decision.intent != "general":
        return decision
    if len(message.strip()) < 15:
        return decision

    request = CompletionRequest(
        messages=[
            ChatMessage(role="system", content=ENGAGEMENT_SYSTEM),
            ChatMessage(role="user", content=redact_pii(message)),
        ],
        deadline=deadline,
        max_tokens=60,
        model_override=engagement_model,
    )
    try:
        result = await client.complete(request)
    except OpenRouterError:
        return decision.model_copy(update={"status": "llm_error", "model_calls": 1})
    if result.dry_run:
        return decision.model_copy(update={"status": "skipped"})
    try:
        parsed = EngagementLLMOutput.model_validate(json.loads(_strip_fence(result.text)))
    except (ValueError, ValidationError):
        return decision.model_copy(update={"status": "llm_invalid", "model_calls": 1})

    suggest = parsed.demo_interest or parsed.intent == "forwarder"
    if parsed.intent == "transport_consumer" and not parsed.demo_interest:
        suggest = False
    return EngagementDecision(
        intent=parsed.intent,
        demo_interest=parsed.demo_interest,
        suggest_cta=suggest,
        status="llm",
        model_calls=1,
        tokens=result.tokens,
    )


def _strip_fence(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.strip("`")
        if stripped.lower().startswith("json"):
            stripped = stripped[4:]
    return stripped.strip()
