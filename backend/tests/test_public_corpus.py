"""Corpus público de Logix: solo lo autorizado para visitantes. Sin red."""

import json
import re

import pytest

from app.services.knowledge_service import PUBLIC_CORPUS_FILE, KnowledgeBase


@pytest.fixture(scope="module")
def corpus() -> dict:
    return json.loads(PUBLIC_CORPUS_FILE.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def kb() -> KnowledgeBase:
    return KnowledgeBase.load()


def test_every_corpus_entry_has_source_scope_and_approval(corpus):
    assert corpus["entries"]
    for entry in corpus["entries"]:
        assert entry["scope"] == "public", entry["id"]
        assert entry["approval"] == "approved", entry["id"]
        assert entry["source"].strip(), entry["id"]
        assert entry["approved_basis"].strip(), entry["id"]
        assert entry["locale"] == "es", entry["id"]


def test_corpus_ids_are_unique(corpus):
    ids = [e["id"] for e in corpus["entries"]]
    assert len(ids) == len(set(ids))


def test_knowledge_base_version_includes_corpus_version(kb, corpus):
    assert kb.version.endswith("+" + corpus["version"])


def test_internal_or_unapproved_entries_are_not_loaded(kb):
    # Una entrada interna o no aprobada nunca entra al índice de búsqueda.
    loaded = {e["id"] for e in kb._entries}  # noqa: SLF001 (prueba de integración del índice)
    assert all(not i.startswith("internal-") for i in loaded)


# Cifras, precios, competidores y nombres de plan que NO deben aparecer en el corpus público
# (logixtic-core: 01-fuentes D-01…D-19, 02 §13, 03 §1 Tiers C y D).
FORBIDDEN = re.compile(
    r"(399|3\.000|3\.500|3\.600|3\.500\.000|196\.000|156\.000|USD|COP|\$|"
    r"\b70\s?%|\b500\b|\b700\b|\b800\b|\b2x\b|\b80\s?%|\b65\s?%|"
    r"ticket|win rate|RQS|RQL|Playbook|Anexo|"
    r"CargoWise|Magaya|Perse|NuevaFLO|Flexport|Freightos|LogistaaS|Apunto|Translog|Conecta Cargo|"
    r"Standard|Enterprise|Esencial|Corporativo|"
    r"cumple con BASC|certificad[oa] en|"
    r"\b4 semanas\b|\b\d+ semanas\b|clientes? (en|de) (EE|Estados))",
    re.IGNORECASE,
)


def test_public_corpus_has_no_internal_numbers_prices_or_competitors(corpus):
    for entry in corpus["entries"]:
        # Solo las respuestas afirman algo; una pregunta de visitante puede nombrar una norma.
        match = FORBIDDEN.search(entry["answer"])
        assert match is None, f"{entry['id']} contiene «{match.group(0) if match else ''}»"


def test_only_labelled_scenarios_contain_percentages(corpus):
    # Los únicos porcentajes permitidos son escenarios ilustrativos (20/40/60 %), rotulados como no garantía.
    for entry in corpus["entries"]:
        if re.search(r"\d\s?%", entry["answer"]):
            assert entry["id"] == "corpus-diag-03", entry["id"]
    scenario = next(e for e in corpus["entries"] if e["id"] == "corpus-diag-03")
    assert "20 %, 40 % o 60 %" in scenario["answer"]
    assert "no una garantía" in scenario["answer"]


def test_corpus_never_promises_an_integration_or_a_timeline(corpus):
    for entry in corpus["entries"]:
        text = entry["answer"].lower()
        assert "se integra con" not in text, entry["id"]
        assert "integramos con" not in text, entry["id"]
        assert "en 4 semanas" not in text and "semanas" not in text, entry["id"]


def test_key_questions_retrieve_the_expected_approved_entries(kb):
    assert kb.search("¿Qué es Logixtic?", limit=1, locale="es")[0].id in {
        "corpus-valor-01",
        "faq-01",
    }
    assert kb.search("¿Cómo ayuda a reducir el trabajo manual?", limit=1, locale="es")[0].id == (
        "corpus-manual-01"
    )
    assert kb.search("¿Se integra con SAP?", limit=1, locale="es")[0].id == "corpus-int-01"


def test_brand_question_does_not_pull_unrelated_entries(kb):
    top = [h.id for h in kb.search("¿Qué es Logixtic?", limit=3, locale="es")]
    assert "corpus-cert-01" not in top
    assert "corpus-price-01" not in top


def test_unrelated_question_gets_no_source(kb):
    assert kb.search("precio del café en Japón", limit=3, locale="es") == []


def test_follow_up_context_is_retrievable_with_previous_turn(kb):
    from app.services.agent_orchestrator import Turn, retrieval_query

    turns = [Turn(role="user", content="¿Qué es Logixtic?")]
    query = retrieval_query("¿Y cómo se implementa eso?", turns)
    assert "Logixtic" in query
    assert kb.search(query, limit=3, locale="es")
