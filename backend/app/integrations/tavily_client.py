"""Cliente de Tavily (Search y Extract) con errores controlados y lectura defensiva.

- Clave solo en `Authorization: Bearer`, leída del entorno; nunca se registra ni se incluye en
errores.
- Search con profundidad y número de resultados limitados por configuración.
- Extract solo para URLs ya validadas por web_policy (ver web_policy.py).
- El contenido devuelto es NO CONFIABLE: el llamador debe tratarlo como datos, nunca como
instrucciones.
"""

from typing import Literal

import httpx
from pydantic import BaseModel, Field

from app.core.config import Settings

TavilyKind = Literal["config", "auth", "quota", "timeout", "network", "http", "invalid", "empty"]


class TavilyError(RuntimeError):
    def __init__(self, kind: TavilyKind, message: str) -> None:
        super().__init__(message)
        self.kind = kind


class SearchItem(BaseModel):
    url: str
    title: str = Field(default="", max_length=300)
    snippet: str = Field(default="", max_length=2000)
    score: float = 0.0


class ExtractItem(BaseModel):
    url: str
    content: str = Field(default="", max_length=20000)


class TavilyResponse(BaseModel):
    items: list
    credits: float = 0.0


def classify_status(status: int) -> TavilyKind:
    if status in (401, 403):
        return "auth"
    if status in (429, 432, 433):
        return "quota"
    return "http"


def _credits(data: dict, default: float) -> float:
    usage = data.get("usage")
    if isinstance(usage, dict) and isinstance(usage.get("credits"), (int, float)):
        return float(usage["credits"])
    return default


class TavilyClient:
    def __init__(
        self, settings: Settings, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self._settings = settings
        self._transport = transport

    async def _post(self, path: str, body: dict) -> dict:
        key = self._settings.tavily_api_key.get_secret_value()
        if not key:
            raise TavilyError("config", "Tavily no está configurado")
        try:
            async with httpx.AsyncClient(
                base_url=self._settings.tavily_api_base.rstrip("/"),
                timeout=self._settings.tavily_timeout_seconds,
                transport=self._transport,
            ) as client:
                response = await client.post(
                    path, json=body, headers={"Authorization": f"Bearer {key}"}
                )
        except httpx.TimeoutException as exc:
            raise TavilyError("timeout", "tiempo agotado en Tavily") from exc
        except httpx.HTTPError as exc:
            raise TavilyError("network", "error de red con Tavily") from exc
        if response.status_code >= 400:
            raise TavilyError(
                classify_status(response.status_code),
                f"Tavily respondió HTTP {response.status_code}",
            )
        try:
            data = response.json()
        except ValueError as exc:
            raise TavilyError("invalid", "respuesta de Tavily no válida") from exc
        if not isinstance(data, dict):
            raise TavilyError("invalid", "respuesta de Tavily no válida")
        return data

    async def search(self, query: str, *, max_results: int | None = None) -> TavilyResponse:
        depth = self._settings.tavily_search_depth
        body = {
            "query": query,
            "search_depth": depth,
            "max_results": max_results or self._settings.tavily_max_results,
            "include_answer": False,
            "include_raw_content": False,
        }
        data = await self._post("/search", body)
        raw = data.get("results")
        if not isinstance(raw, list):
            raise TavilyError("invalid", "respuesta de búsqueda no válida")
        items: list[SearchItem] = []
        for row in raw:
            if not isinstance(row, dict) or not isinstance(row.get("url"), str):
                continue
            items.append(
                SearchItem(
                    url=row["url"],
                    title=str(row.get("title", ""))[:300],
                    snippet=str(row.get("content", ""))[:2000],
                    score=float(row.get("score") or 0.0),
                )
            )
        default_credits = 2.0 if depth == "advanced" else 1.0
        return TavilyResponse(items=items, credits=_credits(data, default_credits))

    async def extract(self, urls: list[str]) -> TavilyResponse:
        if not urls:
            raise TavilyError("invalid", "sin URLs para extraer")
        data = await self._post("/extract", {"urls": urls, "extract_depth": "basic"})
        raw = data.get("results")
        if not isinstance(raw, list):
            raise TavilyError("invalid", "respuesta de extracción no válida")
        items = [
            ExtractItem(
                url=str(row["url"]),
                content=str(row.get("raw_content") or row.get("content") or "")[:20000],
            )
            for row in raw
            if isinstance(row, dict) and isinstance(row.get("url"), str)
        ]
        # Extract cobra 1 crédito por cada 5 URLs (plan básico).
        default_credits = float(-(-len(urls) // 5))
        return TavilyResponse(items=items, credits=_credits(data, default_credits))
