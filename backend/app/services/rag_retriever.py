"""Recuperación híbrida desde Supabase (pgvector) con respaldo al conocimiento local.

Orden:
  1. RAG_ENABLED=false => no se usa Supabase (comportamiento actual).
  2. Mensajes sociales cortos (saludo, cortesía) => no se consulta nada.
  3. Embedding de la pregunta (mismo modelo y dimensión que la ingesta).
     Si falla => búsqueda solo textual.
  4. RPC match_knowledge_hybrid con la clave de servidor (cabecera apikey). Si falla o no hay
     resultados => el orquestador usa el conocimiento local (lexical).

Solo devuelve contenido aprobado y publicado (lo filtra la base). Nunca registra el texto de la
consulta ni de los fragmentos.
"""

import time
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Literal

import httpx

from app.core.config import Settings
from app.integrations.embeddings import EmbeddingError, EmbeddingProvider
from app.services.knowledge_service import KnowledgeHit

RetrievalMode = Literal["rag_hybrid", "rag_text", "none"]
RPC_PATH = "/rest/v1/rpc/match_knowledge_hybrid"


def _vector_literal(vector: list[float] | None) -> str | None:
    """Representación textual de un vector (pgvector acepta '[x,y,...]')."""
    if vector is None:
        return None
    return "[" + ",".join(repr(float(x)) for x in vector) + "]"


@dataclass
class RetrievalResult:
    hits: list[KnowledgeHit] = field(default_factory=list)
    mode: RetrievalMode = "none"
    embedding_status: str = "skipped"
    rpc_status: str = "skipped"


class RagRetriever:
    def __init__(
        self,
        settings: Settings,
        embeddings: EmbeddingProvider | None,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._settings = settings
        self._embeddings = embeddings
        self._transport = transport

    async def retrieve(
        self,
        query: str,
        locale: str,
        *,
        deadline: float | None,
        reserve_call: Callable[[], bool],
        clock: Callable[[], float] = time.monotonic,
    ) -> RetrievalResult:
        settings = self._settings
        if not settings.rag_enabled:
            return RetrievalResult(embedding_status="skipped", rpc_status="skipped")
        if not settings.supabase_url or not settings.supabase_secret_key.get_secret_value():
            return RetrievalResult(embedding_status="skipped", rpc_status="config")

        remaining = self._remaining(deadline, clock)
        if remaining < 1.0:
            return RetrievalResult(embedding_status="deadline", rpc_status="skipped")

        # 1. Embedding de la pregunta (si hay presupuesto de llamadas y tiempo).
        vector: list[float] | None = None
        embedding_status = "skipped"
        if self._embeddings is not None:
            if reserve_call():
                try:
                    vectors = await self._embeddings.embed([query])
                    vector = vectors[0]
                    embedding_status = "ok"
                except EmbeddingError as exc:
                    embedding_status = exc.kind
            else:
                embedding_status = "budget"

        # 2. RPC híbrida (o textual si no hay embedding).
        payload = {
            "p_query_text": query,
            "p_query_embedding": None
            if vector is None
            else "[" + ",".join(repr(float(x)) for x in vector) + "]",
            "p_locale": locale,
            "p_limit": settings.rag_top_k,
            "p_candidates": settings.rag_candidates,
            "p_min_similarity": settings.rag_min_similarity,
        }
        rows, rpc_status = await self._rpc(
            payload, timeout=min(settings.rag_timeout_seconds, remaining)
        )
        if rpc_status != "ok" or not rows:
            return RetrievalResult(embedding_status=embedding_status, rpc_status=rpc_status)

        hits = [
            KnowledgeHit(
                id=str(row["source_slug"]),
                source=str(row["source_slug"]),
                question=str(row["source_slug"]),
                answer=str(row["content"]),
                score=int(round(float(row.get("score") or 0) * 10000)),
            )
            for row in rows
        ]
        mode: RetrievalMode = "rag_hybrid" if vector is not None else "rag_text"
        return RetrievalResult(
            hits=hits, mode=mode, embedding_status=embedding_status, rpc_status="ok"
        )

    @staticmethod
    def _remaining(deadline: float | None, clock: Callable[[], float]) -> float:
        if deadline is None:
            return 1e9
        return max(deadline - clock(), 0.0)

    async def _rpc(self, payload: dict, *, timeout: float) -> tuple[list[dict], str]:
        settings = self._settings
        secret = settings.supabase_secret_key.get_secret_value()
        try:
            async with httpx.AsyncClient(
                base_url=settings.supabase_url.rstrip("/"),
                timeout=timeout,
                transport=self._transport,
            ) as client:
                response = await client.post(
                    RPC_PATH,
                    json=payload,
                    # Clave nueva de Supabase: solo en apikey, nunca como Bearer.
                    headers={"apikey": secret, "Content-Type": "application/json"},
                )
        except httpx.TimeoutException:
            return [], "timeout"
        except httpx.HTTPError:
            return [], "network"
        if response.status_code >= 400:
            return [], "http"
        try:
            data = response.json()
        except ValueError:
            return [], "invalid"
        if not isinstance(data, list):
            return [], "invalid"
        return [row for row in data if isinstance(row, dict)], "ok"
