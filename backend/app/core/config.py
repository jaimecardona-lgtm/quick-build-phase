"""Configuración del servicio leída de variables de entorno y de un .env local (nunca versionado).

Las variables opcionales de OpenRouter no impiden arrancar el servicio ni responder /api/v1/health.
"""

from functools import lru_cache
from typing import Annotated, Literal
from urllib.parse import urlsplit

from pydantic import Field, SecretStr, field_validator
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
    openrouter_primary_model: str = ""
    openrouter_fallback_model: str = ""
    openrouter_temperature: float = Field(default=0.3, ge=0.0, le=2.0)
    openrouter_max_tokens: int = Field(default=700, gt=0)
    openrouter_timeout_seconds: float = Field(default=30.0, gt=0)

    agent_dry_run: bool = True

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


@lru_cache
def get_settings() -> Settings:
    return Settings()
