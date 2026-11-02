"""Servicio de investigación web (Tavily) para uso ADMINISTRATIVO y de candidatos. No es parte
del chat.

Garantías:
- Apagado por defecto (TAVILY_ENABLED=false). Extract, también apagado.
- Consulta saneada (sin datos personales ni operativos) antes de salir a un proveedor externo.
- Solo resultados cuya URL pasa la política (HTTPS, lista permitida, IP pública).
- Caché con TTL y deduplicación por URL: una misma consulta no consume créditos dos veces.
- Presupuesto diario de créditos y límite de frecuencia, antes de cada llamada.
- Registro seguro: origen, fecha, resultado y créditos. Sin consulta, sin claves, sin contenido.
- El contenido es NO CONFIABLE: solo se devuelve delimitado (ver web_policy.wrap_untrusted).
"""

import hashlib
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from urllib.parse import urlsplit

from app.core.config import Settings
from app.core.logging import get_logger
from app.integrations.tavily_client import ExtractItem, SearchItem, TavilyClient, TavilyError
from app.services.budget import CreditBudget
from app.services.web_policy import WebPolicyError, sanitize_query, validate_public_url

logger = get_logger(__name__)


@dataclass
class WebResult:
    items: list[SearchItem] = field(default_factory=list)
    cache_hit: bool = False
    credits: float = 0.0
    rejected_urls: int = 0


class WebResearchService:
    def __init__(
        self,
        settings: Settings,
        client: TavilyClient,
        budget: CreditBudget,
        *,
        clock: Callable[[], float] = time.monotonic,
        resolver=None,
    ) -> None:
        self._settings = settings
        self._client = client
        self._budget = budget
        self._clock = clock
        self._cache: dict[str, tuple[float, list[SearchItem]]] = {}
        self._resolver = resolver
        self._calls: list[float] = []

    def _rate_ok(self) -> bool:
        now = self._clock()
        self._calls = [t for t in self._calls if now - t < 60]
        if len(self._calls) >= 5:
            return False
        self._calls.append(now)
        return True

    def _allowed(self, url: str) -> str | None:
        try:
            if self._resolver is None:
                return validate_public_url(url, self._settings.tavily_allowed_domains)
            return validate_public_url(url, self._settings.tavily_allowed_domains, self._resolver)
        except WebPolicyError:
            return None

    async def search(self, query: str) -> WebResult:
        settings = self._settings
        if not settings.tavily_enabled:
            raise TavilyError("config", "búsqueda web desactivada")
        if not settings.tavily_allowed_domains:
            raise TavilyError("config", "no hay dominios permitidos")
        try:
            clean = sanitize_query(query)
        except WebPolicyError as exc:
            raise TavilyError("invalid", str(exc)) from exc

        key = hashlib.sha256(
            f"{settings.tavily_search_depth}|{settings.tavily_max_results}|{clean.lower()}".encode()
        ).hexdigest()
        now = self._clock()
        cached = self._cache.get(key)
        if cached and now - cached[0] < settings.tavily_cache_minutes * 60:
            logger.info(
                "tavily_search",
                extra={
                    "event": "tavily_search",
                    "cache_hit": True,
                    "credits": 0.0,
                    "result_count": len(cached[1]),
                    "error_kind": None,
                },
            )
            return WebResult(items=list(cached[1]), cache_hit=True, credits=0.0)

        estimate = 2.0 if settings.tavily_search_depth == "advanced" else 1.0
        if not self._rate_ok():
            raise TavilyError("quota", "límite de frecuencia de búsqueda web")
        if not self._budget.try_spend(estimate):
            raise TavilyError("quota", "presupuesto diario de créditos agotado")
        try:
            response = await self._client.search(clean)
        except TavilyError as exc:
            self._budget.refund(estimate)
            logger.warning(
                "tavily_search",
                extra={
                    "event": "tavily_search",
                    "cache_hit": False,
                    "credits": 0.0,
                    "result_count": 0,
                    "error_kind": exc.kind,
                },
            )
            raise

        allowed_items: list[SearchItem] = []
        seen: set[str] = set()
        rejected = 0
        for item in response.items:
            safe_url = self._allowed(item.url)
            if safe_url is None or safe_url in seen:
                rejected += safe_url is None
                continue
            seen.add(safe_url)
            allowed_items.append(item.model_copy(update={"url": safe_url}))
        self._cache[key] = (now, allowed_items)
        logger.info(
            "tavily_search",
            extra={
                "event": "tavily_search",
                "cache_hit": False,
                "credits": response.credits,
                "result_count": len(allowed_items),
                "error_kind": None,
            },
        )
        return WebResult(
            items=allowed_items, cache_hit=False, credits=response.credits, rejected_urls=rejected
        )

    async def extract(self, urls: list[str]) -> list[ExtractItem]:
        settings = self._settings
        if not settings.tavily_enabled or not settings.tavily_extract_enabled:
            raise TavilyError("config", "extracción web desactivada")
        safe: list[str] = []
        for url in dict.fromkeys(urls):  # deduplicación conservando el orden
            checked = self._allowed(url)
            if checked is None:
                raise TavilyError("invalid", "URL fuera de la política de seguridad")
            safe.append(checked)
        if not safe:
            raise TavilyError("invalid", "sin URLs para extraer")
        estimate = float(-(-len(safe) // 5))
        if not self._rate_ok():
            raise TavilyError("quota", "límite de frecuencia de extracción")
        if not self._budget.try_spend(estimate):
            raise TavilyError("quota", "presupuesto diario de créditos agotado")
        try:
            response = await self._client.extract(safe)
        except TavilyError as exc:
            self._budget.refund(estimate)
            logger.warning(
                "tavily_extract",
                extra={
                    "event": "tavily_extract",
                    "credits": 0.0,
                    "result_count": 0,
                    "error_kind": exc.kind,
                },
            )
            raise
        logger.info(
            "tavily_extract",
            extra={
                "event": "tavily_extract",
                "credits": response.credits,
                "result_count": len(response.items),
                "error_kind": None,
            },
        )
        return [item for item in response.items if urlsplit(item.url).scheme == "https"]
