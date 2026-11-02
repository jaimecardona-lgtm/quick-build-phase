"""Configuración del servicio leída de variables de entorno y de un .env local (nunca versionado).

Las variables opcionales de OpenRouter no impiden arrancar el servicio ni responder /api/v1/health.
"""

from functools import lru_cache
from typing import Annotated, Literal
from urllib.parse import urlsplit

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

DEFAULT_CORS_ORIGINS = ("http://localhost:3000", "http://localhost:5173")


def _validate_http_url(value: str, label: str) -> str:
    parts = urlsplit(value)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        raise ValueError(f"{label} debe ser una URL http(s) válida.")
    return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: Literal["development", "test", "staging", "production"] = "development"
    api_host: str = "127.0.0.1"
    api_port: int = Field(default=8000, ge=1, le=65535)

    # Lista separada por comas en la variable de entorno. Solo orígenes explícitos.
    cors_allow_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: list(DEFAULT_CORS_ORIGINS),
    )

    openrouter_api_base: str = "https://openrouter.ai/api/v1"
    openrouter_api_key: SecretStr = SecretStr("")
    # Modelos por rol. Primary/fallback vacíos por defecto (configuración segura y sin red);
    # en staging se fijan por entorno. Judge/Engagement llevan los IDs recomendados, pero están
    # apagados hasta activar AGENT_JUDGE_ENABLED / AGENT_ENGAGEMENT_ENABLED.
    openrouter_primary_model: str = ""
    openrouter_fallback_model: str = ""
    openrouter_judge_model: str = "google/gemma-4-31b-it:free"
    openrouter_engagement_model: str = "nvidia/nemotron-3.5-lightning:free"
    openrouter_temperature: float = Field(default=0.2, ge=0.0, le=2.0)
    openrouter_max_tokens: int = Field(default=600, gt=0)
    # Timeout por llamada HTTP a OpenRouter.
    openrouter_timeout_seconds: float = Field(default=8.0, gt=0, le=30)
    # Presupuesto total de una respuesta (primary + fallback). Debe quedar por debajo del
    # timeout del SSR (CHAT_TIMEOUT_MS = 12 s) para que el usuario reciba siempre una respuesta.
    agent_total_timeout_seconds: float = Field(default=9.0, gt=0, le=10)

    agent_dry_run: bool = True
    agent_judge_enabled: bool = False
    agent_engagement_enabled: bool = False
    # Presupuesto diario (UTC) de llamadas y tokens a modelos. Al agotarse se responde solo con
    # contenido aprobado. Valores conservadores para modelos gratuitos.
    agent_daily_model_call_budget: int = Field(default=300, ge=0)
    agent_daily_token_budget: int = Field(default=150_000, ge=0)
    # Un CTA de demo como máximo cada N minutos por sesión (evita insistencia comercial).
    agent_cta_cooldown_minutes: int = Field(default=30, ge=0, le=1440)

    # Persistencia de prospectos en Supabase (proyecto dedicado de staging, nunca el tenant).
    # La clave secreta solo la lee este servicio. Nunca se envía al navegador ni a VITE_*.
    supabase_url: str = ""
    supabase_secret_key: SecretStr = SecretStr("")
    leads_enabled: bool = False
    # Versión del aviso de privacidad que el formulario debe mostrar y aceptar. Debe coincidir.
    privacy_notice_version: str = Field(default="pendiente-aprobacion", min_length=1, max_length=32)

    # Autenticación servidor-servidor desde la pasarela (Edge Function). Nunca se expone al
    # navegador.
    internal_hmac_secret: SecretStr = SecretStr("")
    chat_rate_limit_per_minute: int = Field(default=10, ge=1, le=600)
    chat_max_chars: int = Field(default=800, ge=50, le=2000)

    @field_validator("cors_allow_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("cors_allow_origins")
    @classmethod
    def _validate_origins(cls, origins: list[str]) -> list[str]:
        cleaned: list[str] = []
        for origin in origins:
            # Se rechaza cualquier comodín. Con credenciales, '*' es una combinación insegura.
            if "*" in origin:
                raise ValueError("CORS_ALLOW_ORIGINS no admite '*'; liste orígenes explícitos.")
            parts = urlsplit(origin)
            if parts.scheme not in ("http", "https") or not parts.hostname:
                raise ValueError(f"Origen CORS inválido: {origin!r}")
            if parts.path not in ("", "/") or parts.query or parts.fragment or "@" in parts.netloc:
                raise ValueError(f"El origen CORS debe ser solo esquema, host y puerto: {origin!r}")
            cleaned.append(f"{parts.scheme}://{parts.netloc}")
        return cleaned

    @field_validator("openrouter_api_base")
    @classmethod
    def _validate_api_base(cls, value: str) -> str:
        return _validate_http_url(value, "OPENROUTER_API_BASE")

    @field_validator("supabase_url")
    @classmethod
    def _validate_supabase_url(cls, value: str) -> str:
        if not value:
            return value
        return _validate_http_url(value.rstrip("/"), "SUPABASE_URL")

    @field_validator("openrouter_primary_model", "openrouter_fallback_model")
    @classmethod
    def _validate_model_id(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned and (" " in cleaned or len(cleaned) > 128):
            raise ValueError("Identificador de modelo OpenRouter no válido.")
        return cleaned

    @model_validator(mode="after")
    def _check_timeouts(self) -> "Settings":
        if self.agent_total_timeout_seconds < self.openrouter_timeout_seconds:
            raise ValueError(
                "AGENT_TOTAL_TIMEOUT_SECONDS no puede ser menor que OPENROUTER_TIMEOUT_SECONDS."
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
