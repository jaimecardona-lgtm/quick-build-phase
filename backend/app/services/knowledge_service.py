"""Recuperación simple y versionada sobre el contenido comercial aprobado.

No es RAG vectorial: puntúa coincidencias de términos normalizados (sin acentos) entre la consulta y
las preguntas y respuestas aprobadas. La base se genera desde src/lib/content.ts;
no se edita a mano.
"""

import json
import re
import unicodedata
from pathlib import Path

from pydantic import BaseModel

KNOWLEDGE_FILE = Path(__file__).resolve().parent.parent / "knowledge" / "approved_public_es.json"
STOPWORDS = frozenset(
    {
        "que",
        "como",
        "para",
        "por",
        "los",
        "las",
        "del",
        "una",
        "uno",
        "con",
        "sin",
        "son",
        "esta",
        "este",
        "puede",
        "hay",
        "mas",
        "muy",
        "pero",
        "the",
        "and",
        "de",
        "la",
        "el",
        "en",
        "un",
        "es",
        "se",
        "al",
        "lo",
        "su",
        "sus",
        "mi",
        "tu",
        "y",
        "o",
        "a",
        "what",
        "how",
        "does",
        "are",
        "you",
        "can",
        "uma",
        "com",
    }
)


class KnowledgeHit(BaseModel):
    id: str
    source: str
    question: str
    answer: str
    score: int


def normalize(text: str) -> list[str]:
    decomposed = unicodedata.normalize("NFKD", text.lower())
    ascii_text = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    tokens = re.findall(r"[a-z0-9]+", ascii_text)
    return [t for t in tokens if len(t) > 2 and t not in STOPWORDS]


class KnowledgeBase:
    def __init__(self, version: str, entries: list[dict[str, str]]) -> None:
        self.version = version
        self._entries = entries
        self._index = [
            (set(normalize(e["question"])), set(normalize(e["answer"]))) for e in entries
        ]

    @classmethod
    def load(cls, path: Path = KNOWLEDGE_FILE) -> "KnowledgeBase":
        data = json.loads(path.read_text(encoding="utf-8"))
        return cls(version=str(data["version"]), entries=list(data["entries"]))

    def __len__(self) -> int:
        return len(self._entries)

    def search(self, query: str, limit: int = 3, locale: str | None = None) -> list[KnowledgeHit]:
        terms = set(normalize(query))
        if not terms:
            return []
        scored: list[KnowledgeHit] = []
        for entry, (q_terms, a_terms) in zip(self._entries, self._index, strict=True):
            if locale and entry.get("locale") != locale:
                continue
            score = 2 * len(terms & q_terms) + len(terms & a_terms)
            if score > 0:
                scored.append(
                    KnowledgeHit(
                        id=entry["id"],
                        source=entry["source"],
                        question=entry["question"],
                        answer=entry["answer"],
                        score=score,
                    )
                )
        scored.sort(key=lambda h: (-h.score, h.id))
        return scored[:limit]
