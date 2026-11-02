"""Orquestación del agente: Judge, Engagement, presupuestos, plazos, métricas y anti-repetición.

Sin red: todas las llamadas a OpenRouter pasan por httpx.MockTransport.
"""

import asyncio
import json
import time

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.security import SIGNATURE_HEADER, TIMESTAMP_HEADER, ReplayGuard, sign
from app.integrations.openrouter_client import (
    CompletionRequest,
    HttpOpenRouterClient,
    OpenRouterError,
)
from app.main import create_app
from app.services import engagement_service, judge_service
from app.services.agent_orchestrator import AgentRuntime, answer
from app.services.budget import CtaCooldown, DailyBudget
from app.services.knowledge_service import KnowledgeBase
from app.services.text_guard import redact_pii, unsupported_claims
from tests.conftest import make_settings

FAKE_KEY = "sk-test-not-a-real-key"
QUESTION = "¿Qué es Logixtic?"


def _settings(**overrides):
    base = {
        "app_env": "development",
        "agent_dry_run": False,
        "openrouter_api_key": FAKE_KEY,
        "openrouter_primary_model": "model-a",
        "openrouter_fallback_model": "model-b",
        "openrouter_judge_model": "judge-m",
        "openrouter_engagement_model": "engage-m",
    }
    base.update(overrides)
    return make_settings(**base)


def _resp(text: str, model: str = "model-a", tokens: int = 42) -> httpx.Response:
    return httpx.Response(
        200,
        json={
            "model": model,
            "choices": [{"message": {"content": text}}],
            "usage": {"total_tokens": tokens},
        },
    )


def _runtime(handler, budget_calls=100, **overrides) -> AgentRuntime:
    settings = _settings(**overrides)
    client = HttpOpenRouterClient(settings, transport=httpx.MockTransport(handler))
    return AgentRuntime(
        settings=settings,
        client=client,
        knowledge=KnowledgeBase.load(),
        budget=DailyBudget(call_limit=budget_calls, token_limit=10_000_000),
        cta_cooldown=CtaCooldown(minutes=30),
    )


def _run(runtime, message, session_id=None):
    return asyncio.run(answer(message, runtime, locale="es", session_id=session_id))


def _is_model(request, name):
    return json.loads(request.content)["model"] == name


# ---------- text_guard ----------


def test_redact_pii_removes_email_and_phone():
    text = "Escríbeme a juan.perez@ejemplo.com o al +57 300 123 4567"
    redacted = redact_pii(text)
    assert "juan.perez@ejemplo.com" not in redacted
    assert "300 123 4567" not in redacted
    assert "[correo]" in redacted and "[telefono]" in redacted


def test_unsupported_claims_flags_invented_numbers_and_promises():
    sources = ["Logixtic centraliza operaciones y documentos."]
    issues = unsupported_claims("Logixtic reduce costos un 50% y lo garantizamos.", sources)
    assert any("50" in issue for issue in issues)
    assert any("garantiz" in issue for issue in issues)


def test_unsupported_claims_flags_simulated_tracking():
    issues = unsupported_claims("Tu embarque está en Cartagena y llega mañana.", ["x"])
    assert issues


def test_unsupported_claims_accepts_terms_present_in_sources():
    sources = ["Plan de 3 módulos. Garantizamos soporte en español."]
    assert unsupported_claims("Ofrecemos soporte; garantizamos soporte en español.", sources) == []


# ---------- Judge ----------


def test_judge_deterministic_block_uses_extractive_answer():
    calls = []

    def handler(request):
        calls.append(json.loads(request.content)["model"])
        return _resp("Logixtic cuesta 9999 dólares al mes y es el mejor del mercado.")

    result = _run(_runtime(handler), QUESTION)
    assert result.degraded is True
    assert result.model == "extractive"
    assert result.metrics.degradation_reason == "judge_block"
    assert result.metrics.judge_status == "deterministic_block"
    assert "9999" not in result.text
    assert calls == ["model-a"]  # el juez determinista no llama a ningún modelo


def test_judge_llm_disabled_is_skipped_and_never_called():
    calls = []

    def handler(request):
        calls.append(json.loads(request.content)["model"])
        return _resp("Logixtic es software para agentes de carga.")

    result = _run(_runtime(handler, agent_judge_enabled=False), QUESTION)
    assert result.metrics.judge_status == "skipped"
    assert "judge-m" not in calls


def test_judge_llm_invalid_json_fails_closed():
    def handler(request):
        if _is_model(request, "judge-m"):
            return _resp("no es json")
        return _resp("Logixtic cuesta 3 mil al mes.", model="model-a")

    result = _run(_runtime(handler, agent_judge_enabled=True), QUESTION)
    assert result.metrics.judge_status == "llm_invalid"
    assert result.model == "extractive"


def test_judge_llm_extra_fields_are_rejected():
    def handler(request):
        if _is_model(request, "judge-m"):
            return _resp(json.dumps({"approved": True, "issues": [], "score": 9}))
        return _resp("Logixtic es software para agentes de carga. Incluye 2 módulos principales.")

    result = _run(_runtime(handler, agent_judge_enabled=True), QUESTION)
    assert result.metrics.judge_status == "llm_invalid"


def test_judge_llm_pass_keeps_model_answer():
    def handler(request):
        if _is_model(request, "judge-m"):
            return _resp(json.dumps({"approved": True, "issues": []}))
        return _resp("Logixtic es software para agentes de carga. Incluye 2 módulos principales.")

    result = _run(_runtime(handler, agent_judge_enabled=True), QUESTION)
    assert result.metrics.judge_status == "llm_pass"
    assert result.degraded is False
    expected = "Logixtic es software para agentes de carga. Incluye 2 módulos principales."
    assert result.text == expected


def test_judge_llm_error_blocks_unverified_answer():
    def handler(request):
        if _is_model(request, "judge-m"):
            return httpx.Response(500, json={"error": "boom"})
        return _resp("Logixtic es software para agentes de carga. Incluye 2 módulos principales.")

    result = _run(_runtime(handler, agent_judge_enabled=True), QUESTION)
    assert result.metrics.judge_status == "llm_error"
    assert result.model == "extractive"


def test_judge_not_called_when_answer_has_no_claim_signal():
    calls = []

    def handler(request):
        calls.append(json.loads(request.content)["model"])
        return _resp("Logixtic es software para agentes de carga.")

    _run(_runtime(handler, agent_judge_enabled=True), QUESTION)
    assert "judge-m" not in calls


# ---------- Engagement ----------


@pytest.mark.parametrize(
    ("message", "intent", "suggest"),
    [
        ("Somos un agente de carga y consolidamos contenedores", "forwarder", True),
        ("Necesito una mudanza para mi casa este mes", "transport_consumer", False),
        ("¿Pueden agendar una demo para mi equipo?", "demo_interest", True),
        ("Hola, buen día", "general", False),
    ],
)
def test_engagement_deterministic_intents(message, intent, suggest):
    decision = engagement_service.classify_deterministic(message)
    assert decision.intent == intent
    assert decision.suggest_cta is suggest


def test_engagement_never_suggests_demo_to_transport_consumer_without_demo_interest():
    decision = engagement_service.classify_deterministic("Busco un taxi para viajar mañana")
    assert decision.intent == "transport_consumer"
    assert decision.suggest_cta is False


def test_cta_cooldown_limits_insistence_per_session():
    def handler(request):
        return _resp("Logixtic es software para agentes de carga.")

    runtime = _runtime(handler)
    first = _run(runtime, "Somos agentes de carga, ¿cómo funciona Logixtic?", session_id="s1")
    second = _run(runtime, "Somos agentes de carga, ¿qué más hace Logixtic?", session_id="s1")
    assert first.suggested_action == "demo"
    assert second.suggested_action is None


def test_engagement_llm_receives_redacted_message_only():
    seen = []

    def handler(request):
        body = json.loads(request.content)
        if body["model"] == "engage-m":
            seen.append(body["messages"][-1]["content"])
            return _resp(json.dumps({"intent": "general", "demo_interest": False}), "engage-m")
        return _resp("Logixtic es software para agentes de carga.")

    message = "Hola, soy Ana, mi correo es ana@ejemplo.com y mi teléfono +57 300 111 2233"
    _run(_runtime(handler, agent_engagement_enabled=True), message)
    assert seen, "el modelo de engagement debía invocarse"
    assert "ana@ejemplo.com" not in seen[0]
    assert "300 111 2233" not in seen[0]


def test_engagement_llm_invalid_output_falls_back_to_rules():
    def handler(request):
        if _is_model(request, "engage-m"):
            return _resp("texto libre")
        return _resp("Logixtic es software para agentes de carga.")

    result = _run(
        _runtime(handler, agent_engagement_enabled=True),
        "Hola, quisiera conocer un poco más sobre el producto",
    )
    assert result.metrics.engagement_status == "llm_invalid"
    assert result.text


# ---------- Budgets and deadlines ----------


def test_daily_call_budget_exhausted_answers_extractively_without_network():
    def forbidden(request):
        raise AssertionError(f"Llamada inesperada: {request.url}")

    result = _run(_runtime(forbidden, budget_calls=0), QUESTION)
    assert result.model == "extractive"
    assert result.metrics.degradation_reason == "budget"


def test_budget_counts_calls_and_tokens_across_requests():
    budget = DailyBudget(call_limit=2, token_limit=10_000_000)
    assert budget.try_reserve_call() is True
    assert budget.try_reserve_call() is True
    assert budget.try_reserve_call() is False
    assert budget.exhausted() is True


def test_token_budget_blocks_further_calls():
    budget = DailyBudget(call_limit=100, token_limit=50)
    budget.record_tokens(60)
    assert budget.try_reserve_call() is False


def test_expired_deadline_never_reaches_network():
    def forbidden(request):
        raise AssertionError("no debe llamarse a la red con el plazo vencido")

    settings = _settings()
    client = HttpOpenRouterClient(settings, transport=httpx.MockTransport(forbidden))
    request = CompletionRequest(
        messages=[{"role": "user", "content": "hola"}],
        deadline=time.monotonic() - 1,
    )
    with pytest.raises(OpenRouterError) as info:
        asyncio.run(client.complete(request))
    assert info.value.kind == "deadline"


def test_total_timeout_cannot_be_below_per_call_timeout():
    with pytest.raises(ValidationError):
        make_settings(
            openrouter_timeout_seconds=8.0,
            agent_total_timeout_seconds=5.0,
        )


def test_timeouts_default_to_coherent_values_below_ssr_budget():
    settings = make_settings()
    assert settings.agent_total_timeout_seconds < 12
    assert settings.openrouter_timeout_seconds <= settings.agent_total_timeout_seconds


# ---------- Fallback and metrics ----------


def test_fallback_is_used_after_quota_error_and_reported():
    def handler(request):
        if _is_model(request, "model-a"):
            return httpx.Response(429, json={"error": "quota"})
        return _resp("Logixtic es software para agentes de carga.", model="model-b")

    result = _run(_runtime(handler), QUESTION)
    assert result.metrics.fallback_used is True
    assert result.metrics.effective_model == "model-b"
    assert result.degraded is False


def test_metrics_are_logged_without_conversation_text(caplog):
    def handler(request):
        return _resp("Logixtic es software para agentes de carga.")

    with caplog.at_level("INFO"):
        _run(_runtime(handler), QUESTION)
    records = [r for r in caplog.records if getattr(r, "event", None) == "agent_answer"]
    assert records, "debe registrarse la métrica agent_answer"
    record = records[-1]
    assert record.effective_model == "model-a"
    assert isinstance(record.latency_ms, int)
    assert not hasattr(record, "message_text")
    assert "Logixtic es software" not in caplog.text


# ---------- Anti-repetición de firmas ----------


def test_replayed_signed_request_is_rejected():
    signing_key = "shared-test-signing-key-0123456789"
    app = create_app(make_settings(app_env="production", internal_hmac_secret=signing_key))
    client = TestClient(app)
    body = json.dumps({"message": "hola", "locale": "es"}).encode()
    timestamp = int(time.time())
    headers = {
        "Content-Type": "application/json",
        TIMESTAMP_HEADER: str(timestamp),
        SIGNATURE_HEADER: sign(signing_key, timestamp, body),
    }
    first = client.post("/api/v1/ai/chat", content=body, headers=headers)
    second = client.post("/api/v1/ai/chat", content=body, headers=headers)
    assert first.status_code != 401
    assert second.status_code == 401


def test_replay_guard_expires_after_window():
    guard = ReplayGuard(window_seconds=300)
    assert guard.check_and_store("sig", now=1000) is True
    assert guard.check_and_store("sig", now=1100) is False
    assert guard.check_and_store("sig", now=1400) is True


# ---------- Judge helper contract ----------


def test_judge_evaluate_deterministic_only_when_disabled():
    verdict = asyncio.run(
        judge_service.evaluate(
            "Logixtic es software para agentes de carga.",
            ["Logixtic es software para agentes de carga."],
            client=None,
            enabled=False,
            judge_model="judge-m",
            deadline=None,
        )
    )
    assert verdict.approved is True
    assert verdict.status == "skipped"
