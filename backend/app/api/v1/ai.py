"""Endpoints del agente público. Ver app/core/security.py para la firma servidor-servidor."""

from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, ValidationError

from app.core.gateway import authorize_gateway as _authorize
from app.core.gateway import client_identity
from app.core.logging import get_logger
from app.core.ratelimit_types import RateLimiterLike
from app.integrations.openrouter_client import OpenRouterClient
from app.services.agent_orchestrator import AgentRuntime, answer
from app.services.knowledge_service import KnowledgeBase
from app.tools.registry import ToolNotAllowed, invoke

router = APIRouter(prefix="/ai", tags=["ai"])
logger = get_logger(__name__)
MAX_BODY_BYTES = 8000


class ChatBody(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str | None = Field(default=None, max_length=64)
    locale: Literal["es", "en", "pt-BR"] = "es"
    # Clave de cuota del cliente final, fijada por la pasarela.
    # Solo es fiable dentro del cuerpo firmado.
    client_key: str | None = Field(default=None, max_length=64)


class ChatOut(BaseModel):
    text: str
    sources: list[str]
    model: str
    dry_run: bool
    degraded: bool
    refused: bool
    knowledge_version: str
    suggested_action: str | None = None


def _state(request: Request) -> tuple[Any, OpenRouterClient, KnowledgeBase, RateLimiterLike]:
    state = request.app.state
    return state.settings, state.openrouter, state.knowledge, state.rate_limiter


def _runtime(request: Request) -> AgentRuntime:
    state = request.app.state
    return AgentRuntime(
        settings=state.settings,
        client=state.openrouter,
        knowledge=state.knowledge,
        budget=state.agent_budget,
        cta_cooldown=state.cta_cooldown,
    )


@router.post("/chat", response_model=ChatOut)
async def chat(request: Request) -> ChatOut:
    settings, client, knowledge, limiter = _state(request)
    raw = await request.body()
    if len(raw) > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail="Solicitud demasiado grande.")
    _authorize(request, settings, raw)

    try:
        body = ChatBody.model_validate_json(raw)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail="Mensaje no válido.") from exc

    if not limiter.allow(client_identity(request, settings, body.client_key)):
        raise HTTPException(
            status_code=429, detail="Demasiadas solicitudes. Intenta de nuevo en un minuto."
        )
    if len(body.message) > settings.chat_max_chars:
        raise HTTPException(status_code=422, detail="Mensaje demasiado largo.")

    result = await answer(
        body.message, _runtime(request), locale=body.locale, session_id=body.session_id
    )
    return ChatOut(
        text=result.text,
        sources=result.sources,
        model=result.model,
        dry_run=result.dry_run,
        degraded=result.degraded,
        refused=result.refused,
        knowledge_version=knowledge.version,
        suggested_action=result.suggested_action,
    )


@router.get("/health")
async def ai_health(request: Request) -> dict[str, Any]:
    settings, _client, knowledge, _limiter = _state(request)
    return {
        "status": "ok",
        "dry_run": settings.agent_dry_run,
        "knowledge_version": knowledge.version,
        "knowledge_entries": len(knowledge),
        "model_configured": bool(settings.openrouter_primary_model),
        "signature_required": bool(settings.internal_hmac_secret.get_secret_value()),
        "judge_enabled": settings.agent_judge_enabled,
        "engagement_enabled": settings.agent_engagement_enabled,
    }


@router.post("/tools/{name}")
async def run_tool(name: str, request: Request) -> dict[str, Any]:
    settings, _client, knowledge, _limiter = _state(request)
    raw = await request.body()
    if len(raw) > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail="Solicitud demasiado grande.")
    _authorize(request, settings, raw)
    try:
        args = await request.json()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="JSON no válido.") from exc
    if not isinstance(args, dict):
        raise HTTPException(status_code=422, detail="Se esperaba un objeto JSON.")
    try:
        return invoke(name, knowledge, args)
    except ToolNotAllowed as exc:
        raise HTTPException(status_code=404, detail="Herramienta no disponible.") from exc
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail="Argumentos no válidos.") from exc
