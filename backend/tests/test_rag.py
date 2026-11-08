"""RAG: ingesta, proveedor de embeddings, recuperación híbrida y orquestación con respaldo.

Todo simulado con httpx.MockTransport (sin red). Las pruebas con embeddings y consultas reales están
en docs/productization y se ejecutan contra Postgres efímero, no aquí.
"""

import asyncio
import json
import time
from pathlib import Path

import httpx
import pytest
from pydantic import SecretStr

from app.integrations.embeddings import EmbeddingError, OpenRouterEmbeddings
from app.integrations.openrouter_client import HttpOpenRouterClient
from app.services.agent_orchestrator import AgentRuntime, answer
from app.services.budget import CtaCooldown, DailyBudget
from app.services.knowledge_ingest import (
    EMBEDDING_DIMENSION,
    IngestError,
    build_chunks,
    chunk_text,
    content_hash,
    embed_missing,
    load_cache,
    load_documents,
    render_sql,
)
from app.services.knowledge_service import KnowledgeBase
from app.services.rag_retriever import RagRetriever
from tests.conftest import make_settings

FAKE_KEY = "sk-test-not-a-real-key"
DIM = EMBEDDING_DIMENSION
KB_PATH = Path(__file__).resolve().parents[1] / "app" / "knowledge" / "approved_public_es.json"
SUPA = "https://example-project.supabase.co"
SERVICE_KEY = "TEST-SERVICE-KEY-NOT-REAL"


def _vec(i: int = 0) -> list[float]:
    v = [0.0] * DIM
    v[i % DIM] = 1.0
    return v


def _write_source(tmp_path: Path, entries: list[dict], version: str = "v-test") -> Path:
    path = tmp_path / "kb.json"
    path.write_text(
        json.dumps({"version": version, "entries": entries}, ensure_ascii=False), encoding="utf-8"
    )
    return path


def _entry(
    slug: str, locale: str = "es", question: str = "¿Qué es?", answer_: str = "Respuesta."
) -> dict:
    return {
        "id": slug,
        "locale": locale,
        "kind": "faq",
        "source": "src/lib/content.ts#faqs[0]",
        "question": question,
        "answer": answer_,
    }


# ---------- Ingesta: validación, fragmentos, SQL ----------


def test_real_approved_knowledge_loads_and_chunks_one_per_entry():
    version, docs = load_documents(KB_PATH)
    chunks = build_chunks(docs)
    assert version and len(docs) == 54
    assert len(chunks) == len(docs)
    assert {d.locale for d in docs} == {"es", "en", "pt-BR"}


@pytest.mark.parametrize(
    ("entry", "message"),
    [
        (
            _entry(
                "bad id!",
            ),
            "identificador no válido",
        ),
        (_entry("faq-01", locale="fr"), "idioma no soportado"),
        ({**_entry("faq-02"), "kind": "secret"}, "tipo no soportado"),
        ({**_entry("faq-03"), "source": ""}, "referencia de fuente"),
        (_entry("faq-04", question="  "), "pregunta o respuesta vacía"),
        (_entry("faq-05", answer_="Escribe a juan.perez@ejemplo.com"), "datos personales"),
    ],
)
def test_invalid_documents_are_rejected(tmp_path, entry, message):
    with pytest.raises(IngestError, match=message):
        load_documents(_write_source(tmp_path, [entry]))


def test_duplicate_identifiers_are_rejected(tmp_path):
    with pytest.raises(IngestError, match="duplicado"):
        load_documents(_write_source(tmp_path, [_entry("faq-01"), _entry("faq-01")]))


def test_chunks_respect_size_and_are_never_empty():
    text = ("Frase de prueba. " * 200).strip()
    chunks = chunk_text(text, max_chars=300)
    assert len(chunks) > 1
    assert all(0 < len(c) <= 300 for c in chunks)


def test_content_hash_is_stable_and_sensitive_to_changes():
    assert content_hash("texto") == content_hash("texto")
    assert content_hash("texto") != content_hash("texto ")


def test_sql_escapes_quotes_and_never_deletes_or_updates_chunks(tmp_path):
    entry = _entry("faq-01", answer_="Logixtic's «fragmento» con 'comillas'; DROP TABLE x;")
    _, docs = load_documents(_write_source(tmp_path, [entry]))
    chunks = build_chunks(docs)
    sql = render_sql(
        version="v1",
        docs=docs,
        chunks=chunks,
        vectors={chunks[0].content_sha256: _vec(1)},
        model="m",
        publish=False,
        approved_by=None,
    )
    assert "Logixtic''s" in sql
    assert "DROP TABLE x" in sql  # va como texto escapado dentro de un literal, no como sentencia
    lowered = sql.lower()
    assert "delete " not in lowered
    assert "update public.knowledge_chunks" not in lowered
    assert "on conflict do nothing" in lowered
    assert "extensions.halfvec(2048)" in lowered


def test_without_publish_sql_does_not_approve_sources(tmp_path):
    _, docs = load_documents(_write_source(tmp_path, [_entry("faq-01")]))
    chunks = build_chunks(docs)
    sql = render_sql(
        version="v1",
        docs=docs,
        chunks=chunks,
        vectors={chunks[0].content_sha256: _vec(1)},
        model="m",
        publish=False,
        approved_by=None,
    )
    assert "approved = true" not in sql


def test_publish_requires_a_valid_approver(tmp_path):
    _, docs = load_documents(_write_source(tmp_path, [_entry("faq-01")]))
    chunks = build_chunks(docs)
    vectors = {chunks[0].content_sha256: _vec(1)}
    with pytest.raises(IngestError, match="exige --approved-by"):
        render_sql(
            version="v1",
            docs=docs,
            chunks=chunks,
            vectors=vectors,
            model="m",
            publish=True,
            approved_by=None,
        )
    with pytest.raises(IngestError, match="UUID"):
        render_sql(
            version="v1",
            docs=docs,
            chunks=chunks,
            vectors=vectors,
            model="m",
            publish=True,
            approved_by="no-es-uuid",
        )
    sql = render_sql(
        version="v1",
        docs=docs,
        chunks=chunks,
        vectors=vectors,
        model="m",
        publish=True,
        approved_by="40000000-0000-0000-0000-000000000001",
    )
    assert "approved = true" in sql and "::uuid" in sql


def test_missing_embedding_or_wrong_dimension_is_rejected(tmp_path):
    _, docs = load_documents(_write_source(tmp_path, [_entry("faq-01")]))
    chunks = build_chunks(docs)
    with pytest.raises(IngestError, match="falta embedding"):
        render_sql(
            version="v1",
            docs=docs,
            chunks=chunks,
            vectors={},
            model="m",
            publish=False,
            approved_by=None,
        )
    with pytest.raises(IngestError, match="dimensión"):
        render_sql(
            version="v1",
            docs=docs,
            chunks=chunks,
            vectors={chunks[0].content_sha256: [1.0, 2.0]},
            model="m",
            publish=False,
            approved_by=None,
        )


def test_cache_from_another_model_is_not_reused(tmp_path):
    cache = tmp_path / "cache.json"
    cache.write_text(
        json.dumps({"model": "otro/modelo", "dimension": DIM, "vectors": {"h": _vec(1)}})
    )
    assert load_cache(cache, "nvidia/nemotron-3.5-embed-1b:free") == {}
    assert "h" in load_cache(cache, "otro/modelo")


def test_embedding_only_missing_hashes_are_requested_in_batches(tmp_path):
    entries = [
        _entry(f"faq-{i:02d}", question=f"¿Pregunta {i}?", answer_=f"Respuesta {i}.")
        for i in range(40)
    ]
    _, docs = load_documents(_write_source(tmp_path, entries))
    chunks = build_chunks(docs)
    cache = {chunks[0].content_sha256: _vec(0)}
    sent: list[list[str]] = []

    class Provider:
        model = "m"
        dimension = DIM

        async def embed(self, texts):
            sent.append(list(texts))
            return [_vec(1) for _ in texts]

    result = asyncio.run(embed_missing(Provider(), chunks, cache))
    assert sum(len(batch) for batch in sent) == 39  # el primero ya estaba en caché
    assert all(len(batch) <= 32 for batch in sent)
    assert len(result) == 40


# ---------- Proveedor de embeddings ----------


def _emb_settings(**extra):
    return make_settings(
        openrouter_api_key=FAKE_KEY, openrouter_api_base="https://openrouter.ai/api/v1", **extra
    )


def _emb_ok(texts):
    return httpx.Response(
        200,
        json={
            "model": "m",
            "data": [{"index": i, "embedding": _vec(i)} for i in range(len(texts))],
        },
    )


def test_embeddings_are_parsed_and_validated():
    provider = OpenRouterEmbeddings(
        _emb_settings(),
        transport=httpx.MockTransport(lambda r: _emb_ok(json.loads(r.content)["input"])),
    )
    vectors = asyncio.run(provider.embed(["uno", "dos"]))
    assert len(vectors) == 2 and len(vectors[0]) == DIM


@pytest.mark.parametrize(
    ("handler", "kind"),
    [
        (lambda r: httpx.Response(429, json={"error": "quota"}), "quota"),
        (lambda r: httpx.Response(500), "http"),
        (
            lambda r: httpx.Response(200, json={"data": [{"index": 0, "embedding": [1.0, 2.0]}]}),
            "invalid",
        ),
        (lambda r: httpx.Response(200, json={"data": []}), "invalid"),
        (lambda r: httpx.Response(200, text="no json"), "invalid"),
        (lambda r: (_ for _ in ()).throw(httpx.ReadTimeout("t", request=r)), "timeout"),
    ],
)
def test_embedding_failures_are_classified(handler, kind):
    provider = OpenRouterEmbeddings(_emb_settings(), transport=httpx.MockTransport(handler))
    with pytest.raises(EmbeddingError) as info:
        asyncio.run(provider.embed(["uno"]))
    assert info.value.kind == kind
    assert FAKE_KEY not in str(info.value)


def test_embeddings_without_key_fail_closed():
    provider = OpenRouterEmbeddings(make_settings(openrouter_api_key=""))
    with pytest.raises(EmbeddingError) as info:
        asyncio.run(provider.embed(["uno"]))
    assert info.value.kind == "config"


# ---------- Recuperador híbrido ----------


class _Recorder:
    def __init__(self, rpc_rows=None, rpc_status=200, embed_fail=False):
        self.rpc_rows = rpc_rows if rpc_rows is not None else []
        self.rpc_status = rpc_status
        self.embed_fail = embed_fail
        self.rpc_payloads: list[dict] = []
        self.rpc_headers: list[dict] = []
        self.embed_calls = 0

    def handler(self, request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/embeddings"):
            self.embed_calls += 1
            if self.embed_fail:
                return httpx.Response(429, json={"error": "quota"})
            return _emb_ok(json.loads(request.content)["input"])
        if request.url.path.endswith("/rpc/match_knowledge_hybrid"):
            self.rpc_payloads.append(json.loads(request.content))
            self.rpc_headers.append(dict(request.headers))
            if self.rpc_status != 200:
                return httpx.Response(self.rpc_status, json={"message": "boom"})
            return httpx.Response(200, json=self.rpc_rows)
        raise AssertionError(f"llamada inesperada: {request.url}")


def _rag_settings(**extra):
    values = {
        "app_env": "development",
        "rag_enabled": True,
        "supabase_url": SUPA,
        "supabase_secret_key": SERVICE_KEY,
        "openrouter_api_key": FAKE_KEY,
        "openrouter_api_base": "https://openrouter.ai/api/v1",
    }
    values.update(extra)
    return make_settings(**values)


def _retriever(rec: _Recorder, **extra) -> RagRetriever:
    settings = _rag_settings(**extra)
    provider = OpenRouterEmbeddings(settings, transport=httpx.MockTransport(rec.handler))
    return RagRetriever(settings, provider, transport=httpx.MockTransport(rec.handler))


ROW = {
    "chunk_id": "c1",
    "source_slug": "faq-01",
    "version": "v1",
    "content": "Logixtic es software para agentes de carga.",
    "vector_rank": 1,
    "text_rank": None,
    "score": 0.0164,
}


def _retrieve(retriever, query="¿Qué es?", locale="es", deadline=None, budget_ok=True):
    return asyncio.run(
        retriever.retrieve(query, locale, deadline=deadline, reserve_call=lambda: budget_ok)
    )


def test_rag_disabled_makes_no_network_calls():
    rec = _Recorder([ROW])
    retriever = _retriever(rec, rag_enabled=False)
    result = _retrieve(retriever)
    assert result.mode == "none" and rec.embed_calls == 0 and rec.rpc_payloads == []


def test_hybrid_retrieval_sends_vector_locale_limits_and_server_key():
    rec = _Recorder([ROW])
    result = _retrieve(_retriever(rec), locale="es")
    assert result.mode == "rag_hybrid"
    assert result.hits[0].id == "faq-01" and "agentes de carga" in result.hits[0].answer
    payload = rec.rpc_payloads[0]
    assert payload["p_locale"] == "es"
    assert (
        payload["p_query_embedding"].startswith("[")
        and payload["p_query_embedding"].count(",") == DIM - 1
    )
    assert payload["p_limit"] >= 1 and payload["p_min_similarity"] >= 0
    headers = {k.lower(): v for k, v in rec.rpc_headers[0].items()}
    assert headers["apikey"] == SERVICE_KEY
    assert "authorization" not in headers


def test_embedding_failure_degrades_to_text_only_rpc():
    rec = _Recorder([ROW], embed_fail=True)
    result = _retrieve(_retriever(rec))
    assert result.mode == "rag_text"
    assert result.embedding_status == "quota"
    assert rec.rpc_payloads[0]["p_query_embedding"] is None


def test_exhausted_call_budget_skips_embedding_but_keeps_text_search():
    rec = _Recorder([ROW])
    result = _retrieve(_retriever(rec), budget_ok=False)
    assert rec.embed_calls == 0
    assert result.embedding_status == "budget"
    assert result.mode == "rag_text"


def test_supabase_error_or_empty_result_leaves_lexical_fallback():
    assert _retrieve(_retriever(_Recorder(rpc_status=500))).rpc_status == "http"
    empty = _retrieve(_retriever(_Recorder(rpc_rows=[])))
    assert empty.mode == "none" and empty.hits == []


def test_missing_supabase_config_is_reported_without_calls():
    rec = _Recorder([ROW])
    settings = _rag_settings(supabase_url="")
    retriever = RagRetriever(settings, None, transport=httpx.MockTransport(rec.handler))
    result = _retrieve(retriever)
    assert result.rpc_status == "config" and rec.rpc_payloads == []


def test_expired_deadline_never_reaches_the_network():
    rec = _Recorder([ROW])
    result = _retrieve(_retriever(rec), deadline=time.monotonic() - 1)
    assert result.embedding_status == "deadline"
    assert rec.embed_calls == 0 and rec.rpc_payloads == []


# ---------- Orquestación: RAG con respaldo local ----------


def _runtime(handler, **extra) -> tuple[AgentRuntime, _Recorder]:
    rec = extra.pop("rec", None)
    rag_enabled = extra.pop("rag_enabled", True)
    settings = make_settings(
        app_env="development",
        agent_dry_run=False,
        openrouter_api_key=FAKE_KEY,
        openrouter_primary_model="model-a",
        openrouter_fallback_model="",
        openrouter_api_base="https://openrouter.ai/api/v1",
        **extra,
    )
    if rec is None:
        rec = _Recorder([ROW])
    chat_calls: list[str] = []

    def router(request):
        if request.url.path.endswith("/chat/completions"):
            chat_calls.append(json.loads(request.content)["model"])
            return httpx.Response(
                200,
                json={
                    "model": "model-a",
                    "choices": [{"message": {"content": "Respuesta del modelo."}}],
                },
            )
        return rec.handler(request)

    transport = httpx.MockTransport(router)
    settings = settings.model_copy(
        update={
            "rag_enabled": rag_enabled,
            "supabase_url": SUPA,
            "supabase_secret_key": SecretStr(SERVICE_KEY),
        }
    )
    client = HttpOpenRouterClient(settings, transport=transport)
    retriever = RagRetriever(
        settings, OpenRouterEmbeddings(settings, transport=transport), transport=transport
    )
    runtime = AgentRuntime(
        settings=settings,
        client=client,
        knowledge=KnowledgeBase.load(),
        budget=DailyBudget(100, 10_000_000),
        cta_cooldown=CtaCooldown(30),
        retriever=retriever,
    )
    runtime_chat = chat_calls
    runtime.__dict__["_chat_calls"] = runtime_chat
    return runtime, rec


def _ask(runtime, message, locale="es"):
    return asyncio.run(answer(message, runtime, locale=locale))


def test_commercial_question_uses_rag_hits_and_model():
    runtime, rec = _runtime(None)
    result = _ask(runtime, "¿Qué es Logixtic y cómo ayuda a los agentes de carga?")
    assert result.metrics.retrieval == "rag_hybrid"
    assert result.sources == ["faq-01"]
    assert rec.embed_calls == 1 and len(rec.rpc_payloads) == 1
    assert runtime.__dict__["_chat_calls"] == ["model-a"]


def test_rag_failure_falls_back_to_local_knowledge_without_error():
    rec = _Recorder(rpc_status=500)
    runtime, _ = _runtime(None, rec=rec)
    result = _ask(runtime, "¿Qué es Logixtic y cómo ayuda a los agentes de carga?")
    assert result.metrics.retrieval == "lexical"
    assert result.metrics.rpc_status == "http"
    assert result.sources  # respuesta con fuente aprobada local


def test_social_messages_never_query_supabase_or_embeddings():
    rec = _Recorder([ROW])
    runtime, _ = _runtime(None, rec=rec)
    result = _ask(runtime, "hola")
    assert result.metrics.answer_kind in ("conversational", "deterministic")
    assert rec.embed_calls == 0 and rec.rpc_payloads == []


def test_rag_disabled_keeps_current_lexical_behaviour():
    rec = _Recorder([ROW])
    runtime, _ = _runtime(None, rec=rec, rag_enabled=False)
    result = _ask(runtime, "¿Qué es Logixtic y cómo ayuda a los agentes de carga?")
    assert result.metrics.retrieval == "lexical"
    assert rec.embed_calls == 0 and rec.rpc_payloads == []


def test_retrieval_metrics_never_contain_text_or_secrets(caplog):
    runtime, _ = _runtime(None)
    with caplog.at_level("INFO"):
        _ask(runtime, "¿Qué es Logixtic y cómo ayuda a los agentes de carga?")
    assert FAKE_KEY not in caplog.text and SERVICE_KEY not in caplog.text
    assert "Logixtic es software" not in caplog.text


# ---------- Escritura remota simulada (PostgREST) ----------

from app.services.knowledge_ingest import RemoteWriter, write_remote  # noqa: E402

REMOTE_URL = "https://remote.example.test"
REMOTE_KEY = "TEST-SERVICE-KEY-NOT-REAL"


def _remote_fixture(tmp_path, n=2):
    entries = [
        _entry(f"faq-{i:02d}", question=f"¿Pregunta {i}?", answer_=f"Respuesta {i}.")
        for i in range(n)
    ]
    _, docs = load_documents(_write_source(tmp_path, entries))
    chunks = build_chunks(docs)
    vectors = {c.content_sha256: _vec(i) for i, c in enumerate(chunks)}
    return docs, chunks, vectors


def test_remote_upsert_uses_server_key_only_in_apikey_and_is_idempotent_by_hash(tmp_path):
    docs, chunks, vectors = _remote_fixture(tmp_path, n=3)
    calls = []

    def handler(request):
        calls.append((request.method, request.url.path, dict(request.headers), request.url.params))
        if request.url.path.endswith("knowledge_sources"):
            return httpx.Response(201, json=[{"slug": d.slug, "id": f"id-{d.slug}"} for d in docs])
        if request.url.path.endswith("knowledge_chunks"):
            body = json.loads(request.content)
            return httpx.Response(
                201, json=body[:1] if len(calls) < 9 else []
            )  # 2ª pasada: nada nuevo
        return httpx.Response(201)

    writer = RemoteWriter(REMOTE_URL, REMOTE_KEY, transport=httpx.MockTransport(handler))
    first = asyncio.run(
        write_remote(
            docs=docs,
            chunks=chunks,
            vectors=vectors,
            version="v1",
            model="m",
            publish=False,
            approved_by=None,
            writer=writer,
        )
    )
    assert first["sources_upserted"] == 3 and first["published"] == 0
    for _method, _path, headers, _params in calls:
        h = {k.lower(): v for k, v in headers.items()}
        assert h["apikey"] == REMOTE_KEY and "authorization" not in h
    sources_call = next(c for c in calls if c[1].endswith("knowledge_sources"))
    assert sources_call[3]["on_conflict"] == "slug"
    assert "merge-duplicates" in {k.lower(): v for k, v in sources_call[2].items()}["prefer"]
    chunk_call = next(c for c in calls if c[1].endswith("knowledge_chunks"))
    assert chunk_call[3]["on_conflict"] == "source_id,version,content_sha256"
    assert "ignore-duplicates" in {k.lower(): v for k, v in chunk_call[2].items()}["prefer"]


def test_remote_publish_is_refused_without_approver(tmp_path):
    docs, chunks, vectors = _remote_fixture(tmp_path)
    writer = RemoteWriter(
        REMOTE_URL,
        REMOTE_KEY,
        transport=httpx.MockTransport(lambda r: httpx.Response(201, json=[])),
    )
    with pytest.raises(IngestError, match="exige --approved-by"):
        asyncio.run(
            write_remote(
                docs=docs,
                chunks=chunks,
                vectors=vectors,
                version="v1",
                model="m",
                publish=True,
                approved_by=None,
                writer=writer,
            )
        )


def test_remote_errors_never_expose_the_key(tmp_path):
    docs, chunks, vectors = _remote_fixture(tmp_path)
    writer = RemoteWriter(
        REMOTE_URL,
        REMOTE_KEY,
        transport=httpx.MockTransport(lambda r: httpx.Response(401, text=REMOTE_KEY)),
    )
    with pytest.raises(IngestError) as info:
        asyncio.run(
            write_remote(
                docs=docs,
                chunks=chunks,
                vectors=vectors,
                version="v1",
                model="m",
                publish=False,
                approved_by=None,
                writer=writer,
            )
        )
    assert REMOTE_KEY not in str(info.value)
    assert "401" in str(info.value)


def test_publish_refuses_approver_without_active_profile_or_role(tmp_path):
    docs, chunks, vectors = _remote_fixture(tmp_path)

    def no_profile(request):
        if request.url.path.endswith("/profiles"):
            return httpx.Response(200, json=[])
        raise AssertionError("no debe escribir si el aprobador no es válido")

    writer = RemoteWriter(REMOTE_URL, REMOTE_KEY, transport=httpx.MockTransport(no_profile))
    with pytest.raises(IngestError, match="perfil activo"):
        asyncio.run(
            write_remote(
                docs=docs,
                chunks=chunks,
                vectors=vectors,
                version="v1",
                model="m",
                publish=True,
                approved_by="40000000-0000-0000-0000-000000000001",
                writer=writer,
            )
        )


def test_publish_accepts_active_publisher(tmp_path):
    docs, chunks, vectors = _remote_fixture(tmp_path)

    def handler(request):
        path = request.url.path
        if path.endswith("/profiles"):
            return httpx.Response(200, json=[{"user_id": "x", "active": True}])
        if path.endswith("/role_assignments"):
            return httpx.Response(200, json=[{"role": "publisher"}])
        if path.endswith("knowledge_sources") and request.method == "PATCH":
            return httpx.Response(200, json=[{"slug": d.slug} for d in docs])
        if path.endswith("knowledge_sources"):
            return httpx.Response(201, json=[{"slug": d.slug, "id": f"id-{d.slug}"} for d in docs])
        if path.endswith("knowledge_chunks"):
            return httpx.Response(201, json=[])
        return httpx.Response(201)

    writer = RemoteWriter(REMOTE_URL, REMOTE_KEY, transport=httpx.MockTransport(handler))
    result = asyncio.run(
        write_remote(
            docs=docs,
            chunks=chunks,
            vectors=vectors,
            version="v1",
            model="m",
            publish=True,
            approved_by="40000000-0000-0000-0000-000000000001",
            writer=writer,
        )
    )
    assert result["published"] == len(docs)
