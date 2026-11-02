"""Cliente REST de Supabase (PostgREST) para el registro de prospectos. Solo servidor.

- La clave secreta (sb_secret_*) viaja en la cabecera `apikey`, nunca en `Authorization: Bearer`.
- Reintentos únicamente ante 429 y 5xx, con espera corta. Nunca ante 4xx.
- Idempotencia: `on_conflict=dedupe_key` + `resolution=ignore-duplicates`.
- Ningún error incluye la URL completa, la clave, ni el cuerpo enviado (contiene datos personales).
"""

import asyncio
from typing import Any, Literal

import httpx

from app.core.config import Settings

LEADS_PATH = "/rest/v1/leads"
TIMEOUT_SECONDS = 5.0
MAX_ATTEMPTS = 2
RETRYABLE_STATUS = frozenset({429, 500, 502, 503, 504})


class SupabaseError(RuntimeError):
    """Error controlado. `kind` no contiene detalles de la conexión ni del payload."""

    def __init__(self, kind: Literal["config", "timeout", "network", "rejected", "unavailable"]):
        super().__init__(kind)
        self.kind = kind


class SupabaseRestClient:
    def __init__(
        self,
        settings: Settings,
        transport: httpx.AsyncBaseTransport | None = None,
        retry_backoff_seconds: float = 0.5,
    ) -> None:
        self._base_url = settings.supabase_url.rstrip("/")
        self._secret = settings.supabase_secret_key.get_secret_value()
        self._transport = transport
        self._backoff = retry_backoff_seconds

    @property
    def configured(self) -> bool:
        return bool(self._base_url and self._secret)

    def _headers(self, extra: dict[str, str] | None = None) -> dict[str, str]:
        headers = {"apikey": self._secret, "Accept": "application/json"}
        if extra:
            headers.update(extra)
        return headers

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, str] | None = None,
        json_body: Any = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        if not self.configured:
            raise SupabaseError("config")
        last_kind: Literal["timeout", "network", "unavailable"] = "unavailable"
        for attempt in range(MAX_ATTEMPTS):
            try:
                async with httpx.AsyncClient(
                    base_url=self._base_url,
                    timeout=TIMEOUT_SECONDS,
                    transport=self._transport,
                ) as client:
                    response = await client.request(
                        method,
                        path,
                        params=params,
                        json=json_body,
                        headers=self._headers(headers),
                    )
            except httpx.TimeoutException:
                last_kind = "timeout"
            except httpx.HTTPError:
                last_kind = "network"
            else:
                if response.status_code in RETRYABLE_STATUS:
                    last_kind = "unavailable"
                elif response.status_code >= 400:
                    raise SupabaseError("rejected")
                else:
                    return response
            if attempt + 1 < MAX_ATTEMPTS:
                await asyncio.sleep(self._backoff)
        raise SupabaseError(last_kind)

    async def insert_lead(self, row: dict[str, Any]) -> None:
        """Inserta un prospecto. Si `dedupe_key` ya existe, no falla ni duplica."""
        await self._request(
            "POST",
            LEADS_PATH,
            params={"on_conflict": "dedupe_key"},
            json_body=row,
            headers={
                "Content-Type": "application/json",
                "Prefer": "resolution=ignore-duplicates,return=minimal",
            },
        )

    async def ping(self) -> bool:
        """Comprueba conectividad y permisos mínimos. Devuelve True/False sin detalles."""
        try:
            await self._request("GET", LEADS_PATH, params={"select": "id", "limit": "1"})
        except SupabaseError:
            return False
        return True
