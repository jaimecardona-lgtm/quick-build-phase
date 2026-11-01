"""GET /api/v1/config/public: configuración no sensible para diagnóstico.

Nunca expone claves, URLs internas, nombres de modelos ni orígenes CORS.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app import __version__
from app.api.deps import SettingsDep

router = APIRouter(tags=["config"])


class PublicConfig(BaseModel):
    app_env: str
    api_version: str
    agent_dry_run: bool
    openrouter_configured: bool


@router.get("/config/public", response_model=PublicConfig)
async def public_config(settings: SettingsDep) -> PublicConfig:
    return PublicConfig(
        app_env=settings.app_env,
        api_version=__version__,
        agent_dry_run=settings.agent_dry_run,
        openrouter_configured=bool(settings.openrouter_api_key.get_secret_value()),
    )
