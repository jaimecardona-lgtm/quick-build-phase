"""Agente público: respuestas contextuales, rechazo de rastreo real, fallback y seguridad.

Sin red.
"""

import json
import time

import httpx
from fastapi.testclient import TestClient

from app.core.security import SIGNATURE_HEADER, TIMESTAMP_HEADER, sign
from app.integrations.openrouter_client import build_openrouter_client
from app.main import create_app
from tests.conftest import make_settings

FAKE_KEY = "sk-test-not-a-real-key"


def _settings(**overrides):
    base = {
        "app_env": "development",
        "agent_dry_run": False,
        "openrouter_api_key": FAKE_KEY,
        "openrouter_primary_model": "model-a",
        "openrouter_fallback_model": "model-b",
    }
    base.update(overrides)
    return make_settings(**base)


def _app(settings, handler=None):
    app = create_app(settings)
    if handler is not None:
        app.state.openrouter = build_openrouter_client(
            settings, transport=httpx.MockTransport(handler)
        )
    return app


def _ok(text):
    return httpx.Response(
        200, json={"model": "model-a", "choices": [{"message": {"content": text}}]}
    )


def _ok_handler(request):
    return _ok("Respuesta de prueba.")


def _forbidden_network(request):  # si esta funcion se ejecuta, la prueba falla
    raise AssertionError(f"Llamada de red inesperada: {request.url}")


def test_chat_answers_from_approved_faq_and_cites_source():
    seen = {}

    def handler(request):
        seen["body"] = json.loads(request.content)
        return _ok("Logixtic es software para agentes de carga.")

    client = TestClient(_app(_settings(), handler))
    response = client.post(
        "/api/v1/ai/chat", json={"message": "Que es Logixtic y como ayuda a los agentes de carga?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["text"] == "Logixtic es software para agentes de carga."
    assert data["sources"]
    assert data["degraded"] is False
    assert data["dry_run"] is False
    user_msg = seen["body"]["messages"][1]["content"]
    assert "CONTEXTO APROBADO" in user_msg
    assert "<<<" in user_msg
    assert FAKE_KEY not in response.text


def test_tracking_question_is_refused_without_calling_model():
    client = TestClient(_app(_settings(), _forbidden_network))
    data = client.post(
        "/api/v1/ai/chat", json={"message": "Donde esta mi carga en tiempo real con GPS?"}
    ).json()
    assert data["refused"] is True
    assert "No tengo acceso" in data["text"]


def test_question_without_approved_source_does_not_invent():
    client = TestClient(_app(_settings(), _forbidden_network))
    data = client.post("/api/v1/ai/chat", json={"message": "precio del cafe en Japon"}).json()
    assert data["sources"] == []
    assert "No encuentro esa información" in data["text"]


def test_fallback_model_used_after_rate_limit_error():
    calls = []

    def handler(request):
        model = json.loads(request.content)["model"]
        calls.append(model)
        if model == "model-a":
            return httpx.Response(429, json={"error": "rate"})
        return _ok("Respuesta del modelo de respaldo.")

    client = TestClient(_app(_settings(), handler))
    data = client.post(
        "/api/v1/ai/chat", json={"message": "Que incluye el modulo de documentos?"}
    ).json()
    assert calls == ["model-a", "model-b"]
    assert data["text"] == "Respuesta del modelo de respaldo."


def test_client_error_is_not_retried_and_degrades_to_approved_text():
    calls = []

    def handler(request):
        calls.append(json.loads(request.content)["model"])
        return httpx.Response(400, json={"error": "bad request"})

    client = TestClient(_app(_settings(), handler))
    data = client.post(
        "/api/v1/ai/chat", json={"message": "Que procesos puede centralizar Logixtic?"}
    ).json()
    assert calls == ["model-a"]
    assert data["degraded"] is True
    assert data["model"] == "extractive"
    assert data["text"]


def test_dry_run_default_returns_extractive_answer_without_network():
    client = TestClient(_app(make_settings(app_env="development"), _forbidden_network))
    data = client.post(
        "/api/v1/ai/chat", json={"message": "Como funciona la gestion documental?"}
    ).json()
    assert data["dry_run"] is True
    assert data["degraded"] is True
    assert data["text"]


def test_signature_required_when_secret_configured():
    shared_key = "s3cret-test-value"
    settings = _settings(internal_hmac_secret=shared_key, app_env="production")
    client = TestClient(_app(settings, _ok_handler))
    body = json.dumps({"message": "Que es Logixtic?"}).encode()
    json_header = {"Content-Type": "application/json"}
    assert client.post("/api/v1/ai/chat", content=body, headers=json_header).status_code == 401

    ts = int(time.time())
    bad = {TIMESTAMP_HEADER: str(ts), SIGNATURE_HEADER: "0" * 64, **json_header}
    assert client.post("/api/v1/ai/chat", content=body, headers=bad).status_code == 401

    old = int(time.time()) - 3600
    stale = {
        TIMESTAMP_HEADER: str(old),
        SIGNATURE_HEADER: sign(shared_key, old, body),
        **json_header,
    }
    assert client.post("/api/v1/ai/chat", content=body, headers=stale).status_code == 401

    good = {TIMESTAMP_HEADER: str(ts), SIGNATURE_HEADER: sign(shared_key, ts, body), **json_header}
    assert client.post("/api/v1/ai/chat", content=body, headers=good).status_code == 200


def test_production_without_gateway_secret_is_unavailable():
    client = TestClient(
        _app(make_settings(app_env="production", agent_dry_run=True), _forbidden_network)
    )
    assert client.post("/api/v1/ai/chat", json={"message": "hola"}).status_code == 503


def test_rate_limit_returns_429():
    settings = make_settings(app_env="development", chat_rate_limit_per_minute=2)
    client = TestClient(_app(settings, _forbidden_network))
    statuses = [
        client.post("/api/v1/ai/chat", json={"message": "Que es Logixtic?"}).status_code
        for _ in range(3)
    ]
    assert statuses == [200, 200, 429]


def test_oversized_and_invalid_messages_rejected():
    client = TestClient(_app(make_settings(app_env="development"), _forbidden_network))
    assert client.post("/api/v1/ai/chat", json={"message": ""}).status_code == 422
    assert client.post("/api/v1/ai/chat", json={"message": "x" * 900}).status_code == 422
    big = client.post(
        "/api/v1/ai/chat", content=b"x" * 9000, headers={"Content-Type": "application/json"}
    )
    assert big.status_code == 413


def test_tool_allowlist_blocks_unknown_tools():
    client = TestClient(_app(make_settings(app_env="development"), _forbidden_network))
    assert client.post("/api/v1/ai/tools/get_shipment_status", json={}).status_code == 404
    consent = client.post("/api/v1/ai/tools/request_demo", json={"consent": False}).json()
    assert consent == {"status": "consent_required"}
    granted = client.post("/api/v1/ai/tools/request_demo", json={"consent": True}).json()
    assert granted == {"status": "use_demo_cta"}
    hits = client.post(
        "/api/v1/ai/tools/search_public_content", json={"query": "documentos"}
    ).json()
    assert hits["hits"]
    assert hits["knowledge_version"].startswith("multi-")


def test_ai_health_exposes_no_secrets():
    shared_key = "s3cret-test-value"
    client = TestClient(_app(_settings(internal_hmac_secret=shared_key), _forbidden_network))
    text = client.get("/api/v1/ai/health").text
    assert shared_key not in text
    assert FAKE_KEY not in text
    assert json.loads(text)["signature_required"] is True
