"""Interfaz de embeddings desacoplada del proveedor, con implementación OpenRouter.

- Ingesta y consultas usan siempre el mismo modelo y la misma dimensión (configuración única).
- Cada respuesta se valida: número de vectores, dimensión y valores finitos.
- Errores controlados por categoría; nunca se incluye la clave, el cuerpo ni el texto enviado.
"""

import math
from typing import Literal, Protocol

import httpx
from pydantic import BaseModel

from app.core.config import Settings

EMBEDDING_KIND = Literal["config", "timeout", "network", "quota", "http", "invalid"]
RETRYABLE_STATUS = frozenset({429, 500, 502, 503, 504})


class EmbeddingError(RuntimeError):
    def __init__(self, kind: EMBEDDING_KIND, message: str) -> None:
        super().__init__(message)
        self.kind = kind


class EmbeddingProvider(Protocol):
    model: str
    dimension: int

    async def embed(self, texts: list[str]) -> list[list[float]]: ...


class EmbeddingResult(BaseModel):
    vectors: list[list[float]]
    model: str
    tokens: int | None = None


def validate_vectors(vectors: list[list[float]], expected_count: int, dimension: int) -> None:
    if len(vectors) != expected_count:
        raise EmbeddingError("invalid", "número de vectores distinto del solicitado")
    for vector in vectors:
        if len(vector) != dimension:
            raise EmbeddingError("invalid", "dimensión de embedding inesperada")
        if not all(isinstance(x, (int, float)) and math.isfinite(x) for x in vector):
            raise EmbeddingError("invalid", "valores de embedding no finitos")


class OpenRouterEmbeddings:
    """Proveedor real vía OpenRouter (/embeddings). La clave solo se lee del entorno."""

    def __init__(
        self, settings: Settings, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self._settings = settings
        self._transport = transport
        self.model = settings.rag_embedding_model
        self.dimension = settings.rag_embedding_dimension

    async def embed(self, texts: list[str]) -> list[list[float]]:
        api_key = self._settings.openrouter_api_key.get_secret_value()
        if not api_key or not self.model:
            raise EmbeddingError("config", "embeddings no configurados")
        if not texts:
            return []
        try:
            async with httpx.AsyncClient(
                base_url=self._settings.openrouter_api_base,
                timeout=self._settings.rag_timeout_seconds,
                transport=self._transport,
            ) as client:
                response = await client.post(
                    "embeddings",
                    json={"model": self.model, "input": texts},
                    headers={"Authorization": f"Bearer {api_key}"},
                )
        except httpx.TimeoutException as exc:
            raise EmbeddingError("timeout", "tiempo agotado en embeddings") from exc
        except httpx.HTTPError as exc:
            raise EmbeddingError("network", "error de red en embeddings") from exc

        if response.status_code == 429:
            raise EmbeddingError("quota", "cuota de embeddings agotada")
        if response.status_code >= 400:
            raise EmbeddingError("http", f"embeddings respondió HTTP {response.status_code}")
        try:
            data = response.json()
            items = sorted(data["data"], key=lambda item: item.get("index", 0))
            vectors = [[float(x) for x in item["embedding"]] for item in items]
        except (ValueError, KeyError, TypeError) as exc:
            raise EmbeddingError("invalid", "respuesta de embeddings no válida") from exc
        validate_vectors(vectors, expected_count=len(texts), dimension=self.dimension)
        return vectors


def build_embedding_provider(
    settings: Settings, transport: httpx.AsyncBaseTransport | None = None
) -> EmbeddingProvider:
    return OpenRouterEmbeddings(settings, transport=transport)
