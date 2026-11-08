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
# Corpus público de Logix (logixtic-core). Solo entran entradas con scope=public y approval=approved.
PUBLIC_CORPUS_FILE = Path(__file__).resolve().parent.parent / "knowledge" / "public_corpus_es.json"
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
    # Raíz aproximada de siete letras: "implementa" y "implementación" comparten base.
    return [t[:7] for t in tokens if len(t) > 2 and t not in STOPWORDS]


def _all_tokens(text: str) -> set[str]:
    """Todas las palabras de dos letras o más, incluidas las vacías ('qué', 'es'). Solo para desempates."""
    decomposed = unicodedata.normalize("NFKD", text.lower())
    ascii_text = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    return set(re.findall(r"[a-z0-9]{2,}", ascii_text))


class KnowledgeBase:
    def __init__(self, version: str, entries: list[dict[str, str]]) -> None:
        self.version = version
        self._entries = entries
        self._index = [
            (set(normalize(e["question"])), set(normalize(e["answer"]))) for e in entries
        ]
        self._full_questions = [_all_tokens(e["question"]) for e in entries]

    @classmethod
    def load(
        cls,
        path: Path = KNOWLEDGE_FILE,
        corpus_path: Path | None = PUBLIC_CORPUS_FILE,
    ) -> "KnowledgeBase":
        data = json.loads(path.read_text(encoding="utf-8"))
        version = str(data["version"])
        entries = list(data["entries"])
        if corpus_path is not None and corpus_path.exists():
            corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
            public = [
                e
                for e in corpus["entries"]
                if e.get("scope") == "public" and e.get("approval") == "approved"
            ]
            known_ids = {e["id"] for e in entries}
            duplicated = known_ids & {e["id"] for e in public}
            if duplicated:
                raise ValueError(f"Identificadores de conocimiento duplicados: {sorted(duplicated)}")
            entries.extend(public)
            version = f"{version}+{corpus['version']}"
        return cls(version=version, entries=entries)

    def __len__(self) -> int:
        return len(self._entries)

    def search(self, query: str, limit: int = 3, locale: str | None = None) -> list[KnowledgeHit]:
        terms = set(normalize(query))
        if not terms:
            return []
        full_query = _all_tokens(query)
        scored: list[tuple[int, int, KnowledgeHit]] = []
        for entry, (q_terms, a_terms), q_full in zip(
            self._entries, self._index, self._full_questions, strict=True
        ):
            if locale and entry.get("locale") != locale:
                continue
            q_overlap = len(terms & q_terms)
            a_overlap = len(terms & a_terms)
            # Una coincidencia solo en la respuesta no basta si la consulta tiene varias palabras: evita fuentes ajenas.
            if q_overlap == 0 and a_overlap < min(2, len(terms)):
                continue
            score = 2 * q_overlap + a_overlap
            # Desempate: cuántas palabras de la consulta, vacías incluidas, aparecen en la pregunta.
            tie = len(full_query & q_full)
            scored.append(
                (
                    score,
                    tie,
                    KnowledgeHit(
                        id=entry["id"],
                        source=entry["source"],
                        question=entry["question"],
                        answer=entry["answer"],
                        score=score,
                    ),
                )
            )
        scored.sort(key=lambda item: (-item[0], -item[1], item[2].id))
        return [hit for _, _, hit in scored[:limit]]
