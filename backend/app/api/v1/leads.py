"""POST /api/v1/leads: registro de prospectos con consentimiento explícito. Solo desde la pasarela.

Reglas:
- Desactivado por defecto (LEADS_ENABLED=false): responde 503 sin tocar la base de datos.
- Firma HMAC y anti-repetición obligatorias fuera de development/test (gateway.py).
- Esquema estricto: campos extra y `consent_at` enviado por el cliente se rechazan (422).
- `consent_at` lo asigna el servidor (UTC). `consent` debe ser literalmente true.
- La versión del aviso de privacidad debe coincidir con la configurada.
- Idempotencia por clave derivada (hash de correo + origen + día UTC). Sin duplicados.
- Ningún dato personal se registra en logs ni se devuelve en la respuesta.
"""

import hashlib
import re
from datetime import UTC, datetime
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from app.core.gateway import authorize_gateway, client_identity
from app.core.logging import get_logger
from app.integrations.supabase_client import SupabaseError

router = APIRouter(prefix="/leads", tags=["leads"])
logger = get_logger(__name__)

MAX_BODY_BYTES = 4000
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
SOURCE_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")


class LeadIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    company: str = Field(min_length=2, max_length=160)
    contact_name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=6, max_length=254)
    locale: Literal["es", "en", "pt-BR"]
    source: str = Field(min_length=1, max_length=80)
    consent: Literal[True]
    privacy_notice_version: str = Field(min_length=1, max_length=32)

    @field_validator("email")
    @classmethod
    def _email(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not EMAIL_RE.fullmatch(cleaned):
            raise ValueError("correo no válido")
        return cleaned

    @field_validator("source")
    @classmethod
    def _source(cls, value: str) -> str:
        if not SOURCE_RE.fullmatch(value):
            raise ValueError("origen no válido")
        return value


def dedupe_key(email: str, source: str, day: str) -> str:
    """Hash estable: evita duplicados del mismo correo y origen en el mismo día UTC."""
    return hashlib.sha256(f"{email}|{source}|{day}".encode()).hexdigest()


def build_row(lead: LeadIn, notice_version: str, now: datetime) -> dict[str, Any]:
    return {
        "company": lead.company,
        "contact_name": lead.contact_name,
        "email": lead.email,
        "locale": lead.locale,
        "source": lead.source,
        "consent_at": now.isoformat(),
        "privacy_notice_version": notice_version,
        "dedupe_key": dedupe_key(lead.email, lead.source, now.strftime("%Y-%m-%d")),
        "status": "new",
    }


@router.post("", status_code=201)
async def create_lead(request: Request) -> dict[str, str]:
    state = request.app.state
    settings = state.settings
    raw = await request.body()
    if len(raw) > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail="Solicitud demasiado grande.")
    authorize_gateway(request, settings, raw)

    try:
        payload = await request.json()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="JSON no válido.") from exc
    if not isinstance(payload, dict):
        raise HTTPException(status_code=422, detail="Se esperaba un objeto JSON.")

    client_key = payload.get("client_key")
    if not state.lead_rate_limiter.allow(
        client_identity(request, settings, client_key if isinstance(client_key, str) else None)
    ):
        raise HTTPException(status_code=429, detail="Demasiadas solicitudes. Intenta más tarde.")

    if not settings.leads_enabled:
        raise HTTPException(status_code=503, detail="Registro no disponible.")

    try:
        lead = LeadIn.model_validate({k: v for k, v in payload.items() if k != "client_key"})
    except ValidationError as exc:
        # No se devuelve el detalle: podría repetir datos personales enviados.
        raise HTTPException(status_code=422, detail="Datos no válidos.") from exc
    if lead.privacy_notice_version != settings.privacy_notice_version:
        raise HTTPException(status_code=422, detail="Versión de aviso no válida.")

    row = build_row(lead, settings.privacy_notice_version, datetime.now(UTC))
    try:
        await state.supabase.insert_lead(row)
    except SupabaseError as exc:
        logger.warning("lead_store_failed", extra={"event": "lead_store_failed"})
        raise HTTPException(
            status_code=503,
            detail="No se pudo registrar tu solicitud. Intenta más tarde.",
        ) from exc

    logger.info("lead_received", extra={"event": "lead_received"})
    return {"status": "received"}
