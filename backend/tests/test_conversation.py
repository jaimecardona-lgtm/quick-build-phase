"""Manejo conversacional (ES/EN/PT-BR) y uso real del modelo para preguntas comerciales.

Sin red: OpenRouter se simula con httpx.MockTransport y se cuentan las llamadas.
"""

import asyncio
import json

import httpx
import pytest

from app.integrations.openrouter_client import HttpOpenRouterClient
from app.services.agent_orchestrator import AgentRuntime, answer
from app.services.budget import CtaCooldown, DailyBudget
from app.services.conversation import classify_social, social_text
from app.services.knowledge_service import KnowledgeBase
from tests.conftest import make_settings

FAKE_KEY = "sk-test-not-a-real-key"
MODEL_TEXT = "Respuesta generada por el modelo de prueba."


def _runtime(handler, **overrides) -> tuple[AgentRuntime, list[str]]:
    calls: list[str] = []

    def recording(request):
        calls.append(json.loads(request.content)["model"])
        return handler(request)

    values = {
        "app_env": "development",
        "agent_dry_run": False,
        "openrouter_api_key": FAKE_KEY,
        "openrouter_primary_model": "model-a",
        "openrouter_fallback_model": "",
    }
    values.update(overrides)
    settings = make_settings(**values)
    client = HttpOpenRouterClient(settings, transport=httpx.MockTransport(recording))
    runtime = AgentRuntime(
        settings=settings,
        client=client,
        knowledge=KnowledgeBase.load(),
        budget=DailyBudget(call_limit=100, token_limit=10_000_000),
        cta_cooldown=CtaCooldown(minutes=30),
    )
    return runtime, calls


def _ok(request):
    return httpx.Response(
        200,
        json={"model": "model-a", "choices": [{"message": {"content": MODEL_TEXT}}]},
    )


def _run(runtime, message, locale="es"):
    return asyncio.run(answer(message, runtime, locale=locale, session_id=None))


# ---------- Clasificación determinista ----------


@pytest.mark.parametrize(
    ("message", "intent"),
    [
        ("hola", "greeting"),
        ("Hola!", "greeting"),
        ("buenas tardes", "greeting"),
        ("hello", "greeting"),
        ("hi there", "greeting"),
        ("olá", "greeting"),
        ("bom dia", "greeting"),
        ("¿cómo estás?", "how_are_you"),
        ("como estas", "how_are_you"),
        ("how are you?", "how_are_you"),
        ("tudo bem?", "how_are_you"),
        ("gracias", "thanks"),
        ("muchas gracias", "thanks"),
        ("thank you", "thanks"),
        ("obrigado", "thanks"),
        ("adiós", "farewell"),
        ("hasta luego", "farewell"),
        ("bye", "farewell"),
        ("tchau", "farewell"),
        ("ayuda", "ambiguous"),
        ("help", "ambiguous"),
        ("ajuda", "ambiguous"),
        ("¿qué puedes hacer?", "ambiguous"),
        ("no entiendo", "clarification"),
        ("what do you mean?", "clarification"),
        ("não entendi", "clarification"),
        ("???", "ambiguous"),
    ],
)
def test_social_messages_are_classified(message, intent):
    assert classify_social(message) == intent


@pytest.mark.parametrize(
    "message",
    [
        "¿Qué es Logixtic?",
        "What is Logixtic?",
        "o que é a Logixtic?",
        "¿Cómo funciona la implementación de la plataforma para agentes de carga?",
        "¿Tienen integración con el ERP de mi empresa?",
    ],
)
def test_commercial_questions_are_not_social(message):
    assert classify_social(message) is None


@pytest.mark.parametrize("locale", ["es", "en", "pt-BR"])
@pytest.mark.parametrize(
    "intent",
    ["greeting", "how_are_you", "thanks", "farewell", "clarification", "ambiguous"],
)
def test_social_texts_exist_in_each_language_and_claim_nothing(locale, intent):
    text = social_text(intent, locale)
    assert text.strip()
    # Las respuestas sociales no pueden contener cifras, precios ni promesas.
    assert not any(ch.isdigit() for ch in text)
    assert "%" not in text and "$" not in text
    assert "garant" not in text.lower() and "guarantee" not in text.lower()


# ---------- Orquestación: sin modelo para lo social ----------


@pytest.mark.parametrize(
    ("message", "locale", "intent_text_fragment"),
    [
        ("hola", "es", "asistente comercial de Logixtic"),
        ("hello", "en", "sales assistant"),
        ("olá", "pt-BR", "assistente comercial"),
    ],
)
def test_greeting_is_answered_without_calling_the_model(message, locale, intent_text_fragment):
    runtime, calls = _runtime(_ok)
    result = _run(runtime, message, locale=locale)
    assert calls == []
    assert result.metrics.answer_kind == "social"
    assert intent_text_fragment in result.text
    assert result.sources == []


def test_how_are_you_and_farewell_do_not_call_the_model():
    runtime, calls = _runtime(_ok)
    assert _run(runtime, "¿cómo estás?").metrics.answer_kind == "social"
    assert _run(runtime, "adiós", locale="es").metrics.answer_kind == "social"
    assert calls == []


def test_ambiguous_help_request_gets_clarification_not_a_faq_answer():
    runtime, calls = _runtime(_ok)
    result = _run(runtime, "ayuda")
    assert calls == []
    assert result.metrics.answer_kind == "social"
    assert "qué es Logixtic" in result.text


def test_greeting_with_commercial_question_uses_the_model():
    runtime, calls = _runtime(_ok)
    result = _run(runtime, "hola, ¿qué es Logixtic?")
    assert calls == ["model-a"]
    assert result.metrics.answer_kind == "commercial"
    assert result.model == "model-a"


# ---------- Preguntas comerciales: modelo real y fuentes ----------


@pytest.mark.parametrize(
    ("message", "locale"),
    [
        ("¿Qué es Logixtic?", "es"),
        ("What is Logixtic?", "en"),
        ("o que é a Logixtic?", "pt-BR"),
    ],
)
def test_commercial_question_calls_model_and_keeps_sources(message, locale):
    runtime, calls = _runtime(_ok)
    result = _run(runtime, message, locale=locale)
    assert calls == ["model-a"], "la pregunta comercial debe usar el modelo configurado"
    assert result.model == "model-a"
    assert result.metrics.effective_model == "model-a"
    assert result.metrics.answer_kind == "commercial"
    assert result.text == MODEL_TEXT
    assert result.sources, "la respuesta debe conservar las fuentes aprobadas"


def test_question_without_approved_source_does_not_call_model_or_invent():
    runtime, calls = _runtime(_ok)
    result = _run(runtime, "¿Tienen sucursales en Venezuela?")
    assert calls == []
    assert result.metrics.answer_kind == "no_source"
    assert result.sources == []
    assert "venezuela" not in result.text.lower()


# ---------- Fallos de API: fallback determinista ----------


def test_api_500_falls_back_to_deterministic_approved_text():
    runtime, calls = _runtime(lambda request: httpx.Response(500, json={"error": "x"}))
    first = _run(runtime, "¿Qué es Logixtic?")
    second = _run(runtime, "¿Qué es Logixtic?")
    assert first.degraded is True
    assert first.model == "extractive"
    assert first.metrics.degradation_reason == "http"
    assert first.text == second.text, "el fallback debe ser determinista"
    assert first.sources


def test_api_timeout_falls_back_with_reason_timeout():
    def timeout(request):
        raise httpx.ReadTimeout("slow", request=request)

    runtime, _ = _runtime(timeout)
    result = _run(runtime, "¿Qué es Logixtic?")
    assert result.degraded is True
    assert result.metrics.degradation_reason == "timeout"


def test_api_quota_429_falls_back_with_reason_quota():
    runtime, _ = _runtime(lambda request: httpx.Response(429, json={"error": "quota"}))
    result = _run(runtime, "¿Qué es Logixtic?")
    assert result.degraded is True
    assert result.metrics.degradation_reason == "quota"


def test_missing_key_falls_back_with_reason_config():
    runtime, calls = _runtime(_ok, openrouter_api_key="")
    result = _run(runtime, "¿Qué es Logixtic?")
    assert result.degraded is True
    assert result.metrics.degradation_reason == "config"
    assert calls == []


def test_api_error_text_never_reaches_the_user():
    runtime, _ = _runtime(lambda request: httpx.Response(500, text="stack trace SECRET"))
    result = _run(runtime, "¿Qué es Logixtic?")
    assert "stack trace" not in result.text
    assert "SECRET" not in result.text


def test_health_reports_key_presence_without_value():
    from fastapi.testclient import TestClient

    from app.main import create_app

    settings = make_settings(
        app_env="development",
        agent_dry_run=False,
        openrouter_api_key=FAKE_KEY,
        openrouter_primary_model="model-a",
    )
    client = TestClient(create_app(settings))
    body = client.get("/api/v1/ai/health").json()
    assert body["api_key_configured"] is True
    assert body["model_configured"] is True
    assert body["dry_run"] is False
    assert FAKE_KEY not in client.get("/api/v1/ai/health").text


def test_primary_failure_kind_is_recorded_when_fallback_answers():
    def handler(request):
        if json.loads(request.content)["model"] == "model-a":
            return httpx.Response(429, json={"error": "quota"})
        return httpx.Response(
            200, json={"model": "model-b", "choices": [{"message": {"content": MODEL_TEXT}}]}
        )

    settings_runtime, calls = _runtime(handler, openrouter_fallback_model="model-b")
    result = _run(settings_runtime, "¿Qué es Logixtic?")
    assert calls == ["model-a", "model-b"]
    assert result.metrics.fallback_used is True
    assert result.metrics.primary_error_kind == "quota"
    assert result.degraded is False


def test_total_deadline_is_a_hard_clock_limit():
    import time as _time

    async def slow(request):
        await asyncio.sleep(3)
        return httpx.Response(
            200, json={"model": "model-a", "choices": [{"message": {"content": "x"}}]}
        )

    # Por intento 1 s, total 1,5 s: el reloj debe cortar aunque httpx no haya expirado.
    runtime, _ = _runtime(slow, openrouter_timeout_seconds=1.0, agent_total_timeout_seconds=1.5)
    start = _time.monotonic()
    result = _run(runtime, "¿Qué es Logixtic?")
    elapsed = _time.monotonic() - start
    assert result.degraded is True
    assert elapsed < 2.5, f"el límite total no se respetó: {elapsed:.2f}s"


def test_coordinated_timeouts_have_explicit_defaults_and_limits():
    settings = make_settings()
    assert settings.openrouter_timeout_seconds == 12.0
    assert settings.agent_total_timeout_seconds == 20.0
    assert settings.openrouter_timeout_seconds <= settings.agent_total_timeout_seconds
    # El total debe quedar por debajo de la espera del SSR (24 s) con margen.
    assert settings.agent_total_timeout_seconds + 3 < 24
    with pytest.raises(ValueError):
        make_settings(openrouter_timeout_seconds=15.0, agent_total_timeout_seconds=10.0)


def test_empty_content_from_primary_is_a_retryable_failure_and_fallback_answers():
    def handler(request):
        if json.loads(request.content)["model"] == "model-a":
            return httpx.Response(
                200, json={"model": "model-a", "choices": [{"message": {"content": None}}]}
            )
        return httpx.Response(
            200, json={"model": "model-b", "choices": [{"message": {"content": MODEL_TEXT}}]}
        )

    runtime, calls = _runtime(handler, openrouter_fallback_model="model-b")
    result = _run(runtime, "¿Qué es Logixtic?")
    assert calls == ["model-a", "model-b"]
    assert result.text == MODEL_TEXT
    assert result.metrics.primary_error_kind == "empty"
    assert result.degraded is False


def test_unexpected_exception_degrades_to_extractive_without_leaking_details(monkeypatch):
    runtime, _ = _runtime(lambda request: httpx.Response(500))

    async def boom(self, request):
        raise RuntimeError("detalle interno no visible")

    monkeypatch.setattr(HttpOpenRouterClient, "complete", boom)
    result = _run(runtime, "¿Qué es Logixtic?")
    assert result.degraded is True
    assert result.metrics.degradation_reason == "internal"
    assert "detalle interno" not in result.text
    assert result.sources


def test_tracking_request_is_marked_as_refusal_not_commercial():
    runtime, calls = _runtime(_ok)
    result = _run(runtime, "¿Dónde está mi embarque ABC123 ahora mismo?")
    assert calls == []
    assert result.refused is True
    assert result.metrics.answer_kind == "refusal"


def test_primary_failure_is_recorded_even_when_whole_chain_fails():
    def handler(request):
        if json.loads(request.content)["model"] == "model-a":
            return httpx.Response(429, json={"error": "quota"})
        return httpx.Response(
            200, json={"model": "model-b", "choices": [{"message": {"content": None}}]}
        )

    runtime, _ = _runtime(handler, openrouter_fallback_model="model-b")
    result = _run(runtime, "¿Qué es Logixtic?")
    assert result.degraded is True
    assert result.metrics.degradation_reason == "empty"
    assert result.metrics.primary_error_kind == "quota"
