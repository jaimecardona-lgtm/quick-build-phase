"""Autenticación servidor-servidor y límite de frecuencia para el agente público.

La pasarela (Edge Function de Lovable Cloud) firma cada petición con HMAC-SHA256 usando un secreto
compartido por entorno. El navegador nunca recibe el secreto ni puede llamar al agente directamente
cuando el secreto está configurado. No es autenticación de usuarios: el personal se autentica en la
pasarela con Lovable Cloud Auth.
"""

import hashlib
import hmac
import time
from collections import deque

SIGNATURE_HEADER = "X-Logixtic-Signature"
TIMESTAMP_HEADER = "X-Logixtic-Timestamp"
MAX_SKEW_SECONDS = 300


def sign(secret: str, timestamp: int, body: bytes) -> str:
    message = str(timestamp).encode() + b"." + body
    return hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()


def verify_signature(
    secret: str,
    timestamp_header: str | None,
    signature_header: str | None,
    body: bytes,
    now: int | None = None,
) -> bool:
    if not secret or not timestamp_header or not signature_header:
        return False
    try:
        timestamp = int(timestamp_header)
    except ValueError:
        return False
    current = int(time.time()) if now is None else now
    if abs(current - timestamp) > MAX_SKEW_SECONDS:
        return False
    expected = sign(secret, timestamp, body)
    return hmac.compare_digest(expected, signature_header)


class RateLimiter:
    """Ventana deslizante por clave (IP o sesión). Memoria local: un proceso por instancia."""

    def __init__(self, limit_per_minute: int) -> None:
        self._limit = limit_per_minute
        self._hits: dict[str, deque[float]] = {}

    def allow(self, key: str, now: float | None = None) -> bool:
        current = time.monotonic() if now is None else now
        window = self._hits.setdefault(key, deque())
        while window and current - window[0] > 60:
            window.popleft()
        if len(window) >= self._limit:
            return False
        window.append(current)
        return True
