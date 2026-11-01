"""Punto de entrada: `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.v1 import router as v1_router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging, get_logger
from app.core.security import RateLimiter
from app.integrations.openrouter_client import build_openrouter_client
from app.services.knowledge_service import KnowledgeBase

API_V1_PREFIX = "/api/v1"
logger = get_logger(__name__)


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(logging.INFO)

    app = FastAPI(title="Logixtic API", version=__version__)
    app.state.settings = settings

    # Orígenes explícitos, sin comodín. allow_credentials=False: el servicio todavía no usa
    # cookies ni cabeceras de sesión. Si se habilitan credenciales, activarlas solo con orígenes
    # explícitos revisados.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["Content-Type", "Accept"],
    )
    # Estado del agente: cliente de OpenRouter (dry-run por defecto), base aprobada y límite de
    # frecuencia.
    app.state.openrouter = build_openrouter_client(settings)
    app.state.knowledge = KnowledgeBase.load()
    app.state.rate_limiter = RateLimiter(settings.chat_rate_limit_per_minute)
    app.include_router(v1_router, prefix=API_V1_PREFIX)

    logger.info(
        "service_configured", extra={"event": "service_configured", "app_env": settings.app_env}
    )
    return app


app = create_app()
