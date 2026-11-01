"""Endpoints del agente público. Ver app/core/security.py para la firma servidor-servidor."""

from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, ValidationError

from app.core.logging import get_logger
from app.core.ratelimit_types import RateLimiterLike
from app.core.security import SIGNATURE_HEADER, TIMESTAMP_HEADER, verify_signature
from app.integrations.openrouter_client import OpenRouterClient
from app.services.agent_orchestrator import answer
from app.services.knowledge_service import KnowledgeBase
from app.tools.registry import ToolNotAllowed, invoke

router = APIRouter(prefix="/ai", tags=["ai"])
logger = get_logger(__name__)
MAX_BODY_BYTES = 8000


class ChatBody(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str | None = Field(default=None, max_length=64)
    locale: Literal["es", "en", "pt-BR"] = "es"


class ChatOut(BaseModel):
    text: str
    sources: list[str]
    model: str
    dry_run: bool
    degraded: bool
    refused: bool
    knowledge_version: str


def _state(request: Request) -> tuple[Any, OpenRouterClient, KnowledgeBase, RateLimiterLike]:
    state = request.app.state
    return state.settings, state.openrouter, state.knowledge, state.rate_limiter


def _authorize(request: Request, settings: Any, body: bytes) -> None:
    secret = settings.internal_hmac_secret.get_secret_value()
    if secret:
        if not verify_signature(
            secret,
            request.headers.get(TIMESTAMP_HEADER),
            request.headers.get(SIGNATURE_HEADER),
            body,
        ):
            raise HTTPException(status_code=401, detail="Firma no válida.")
        return
    if settings.app_env in ("development", "test"):
        return
    raise HTTPException(status_code=503, detail="Pasarela no configurada.")


@router.post("/chat", response_model=ChatOut)
async def chat(request: Request) -> ChatOut:
    settings, client, knowledge, limiter = _state(request)
    raw = await request.body()
    if len(raw) > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail="Solicitud demasiado grande.")
    _authorize(request, settings, raw)

    client_key = request.client.host if request.client else "unknown"
    if not limiter.allow(client_key):
        raise HTTPException(
            status_code=429, detail="Demasiadas solicitudes. Intenta de nuevo en un minuto."
        )

    try:
        body = ChatBody.model_validate_json(raw)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail="Mensaje no válido.") from exc
    if len(body.message) > settings.chat_max_chars:
        raise HTTPException(status_code=422, detail="Mensaje demasiado largo.")

    result = await answer(body.message, client, knowledge, locale=body.locale)
    logger.info("chat_answered", extra={"event": "chat_answered"})
    return ChatOut(
        text=result.text,
        sources=result.sources,
        model=result.model,
        dry_run=result.dry_run,
        degraded=result.degraded,
        refused=result.refused,
        knowledge_version=knowledge.version,
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
