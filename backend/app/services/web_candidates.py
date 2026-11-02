"""Candidatos de conocimiento desde la web: pendientes de revisión humana. Nunca se publican solos.

Un candidato es una fuente con `approved = false` y una versión que no coincide con
`published_version`,
así que la recuperación híbrida no lo devuelve. Publicar sigue exigiendo el flujo de
knowledge_ingest
con aprobador real de Supabase Auth.
"""

import hashlib
from collections.abc import Sequence

from app.integrations.tavily_client import ExtractItem
from app.services.knowledge_ingest import ALLOWED_LOCALES, IngestError, SourceDoc
from app.services.text_guard import redact_pii


def candidate_slug(url: str) -> str:
    return "web-" + hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]


def build_candidates(
    items: Sequence[ExtractItem], *, locale: str, retrieved_on: str
) -> list[SourceDoc]:
    """Convierte contenido extraído en candidatos. Rechaza datos personales y locales no
    soportados."""
    if locale not in ALLOWED_LOCALES:
        raise IngestError("idioma no soportado para candidatos")
    docs: list[SourceDoc] = []
    for item in items:
        text = " ".join(item.content.split())
        if not text:
            continue
        if redact_pii(text) != text:
            raise IngestError("el contenido externo contiene datos personales; descartado")
        docs.append(
            SourceDoc(
                slug=candidate_slug(item.url),
                locale=locale,
                kind="other",
                source_reference=f"{item.url} | recuperado {retrieved_on} | pendiente de revisión",
                text=text[:4000],
            )
        )
    return docs
