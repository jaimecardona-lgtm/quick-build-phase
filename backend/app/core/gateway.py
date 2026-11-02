"""Autorización de peticiones desde la pasarela SSR (firma HMAC, anti-repetición y cliente).

- Con INTERNAL_HMAC_SECRET configurado: exige firma válida, no repetida y dentro de la ventana.
- Sin secreto: solo development/test. En cualquier otro entorno responde 503 (no configurado).
- Identidad de cliente: la pasarela puede enviar `client_key` dentro del cuerpo firmado. Como el
  cuerpo está firmado, el visitante no puede falsearla. Sin firma (solo dev) se usa la IP del
  socket.
  Nunca se confía en X-Forwarded-For enviado por el navegador.
"""

import re
from typing import Any

from fastapi import HTTPException, Request

from app.core.security import SIGNATURE_HEADER, TIMESTAMP_HEADER, ReplayGuard, verify_signature

CLIENT_KEY_RE = re.compile(r"^[A-Za-z0-9:._-]{1,64}$")


def authorize_gateway(request: Request, settings: Any, body: bytes) -> None:
    secret = settings.internal_hmac_secret.get_secret_value()
    if secret:
        signature = request.headers.get(SIGNATURE_HEADER)
        if not verify_signature(
            secret,
            request.headers.get(TIMESTAMP_HEADER),
            signature,
            body,
        ):
            raise HTTPException(status_code=401, detail="Firma no válida.")
        replay_guard: ReplayGuard = request.app.state.replay_guard
        if signature is None or not replay_guard.check_and_store(signature):
            raise HTTPException(status_code=401, detail="Firma no válida.")
        return
    if settings.app_env in ("development", "test"):
        return
    raise HTTPException(status_code=503, detail="Pasarela no configurada.")


def client_identity(request: Request, settings: Any, signed_client_key: str | None) -> str:
    """Clave de cuota por cliente.

    Solo usa `client_key` si la firma está activa (cuerpo firmado).
    """
    secret = settings.internal_hmac_secret.get_secret_value()
    if secret and signed_client_key and CLIENT_KEY_RE.fullmatch(signed_client_key):
        return f"gw:{signed_client_key}"
    return f"sock:{request.client.host if request.client else 'unknown'}"
