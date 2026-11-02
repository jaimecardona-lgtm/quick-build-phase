"""Registro de prospectos y readiness con Supabase simulado (httpx.MockTransport). Sin red."""

import json
import time

import httpx
from fastapi.testclient import TestClient

from app.core.gateway import client_identity
from app.core.security import SIGNATURE_HEADER, TIMESTAMP_HEADER, sign
from app.integrations.supabase_client import SupabaseRestClient
from app.main import create_app
from tests.conftest import make_settings

SUPABASE_URL = "https://project-ref.supabase.co"
SUPABASE_TEST_KEY = "sb_secret_TEST_ONLY_not_real_0000000000"
SIGNING_KEY = "gateway-signing-key-test-0123456789"
NOTICE = "2026-11-01-test"
VALID = {
    "company": "Agencia Demo SA",
    "contact_name": "Persona de Prueba",
    "email": "Prueba.Lead@Example.TEST",
    "locale": "es",
    "source": "web-hero",
    "consent": True,
    "privacy_notice_version": NOTICE,
}


def _app(handler=None, *, leads_enabled=True, secret=SIGNING_KEY, app_env="development"):
    settings = make_settings(
        app_env=app_env,
        leads_enabled=leads_enabled,
        supabase_url=SUPABASE_URL,
        supabase_secret_key=SUPABASE_TEST_KEY,
        internal_hmac_secret=secret,
        privacy_notice_version=NOTICE,
    )
    app = create_app(settings)
    if handler is not None:
        app.state.supabase = SupabaseRestClient(
            settings, transport=httpx.MockTransport(handler), retry_backoff_seconds=0
        )
    return app


def _signed(body: dict, secret=SIGNING_KEY):
    raw = json.dumps(body).encode()
    ts = int(time.time())
    headers = {
        "Content-Type": "application/json",
        TIMESTAMP_HEADER: str(ts),
        SIGNATURE_HEADER: sign(secret, ts, raw),
    }
    return raw, headers


def _post(client, body: dict):
    raw, headers = _signed(body)
    return client.post("/api/v1/leads", content=raw, headers=headers)


def _created(request):
    return httpx.Response(201)


def test_valid_lead_is_stored_with_server_consent_and_secret_in_apikey_only():
    captured = {}

    def handler(request):
        captured["headers"] = dict(request.headers)
        captured["body"] = json.loads(request.content)
        captured["url"] = str(request.url)
        return _created(request)

    client = TestClient(_app(handler))
    response = _post(client, VALID)

    assert response.status_code == 201
    assert response.json() == {"status": "received"}
    body = captured["body"]
    assert body["email"] == "prueba.lead@example.test"
    assert body["consent_at"]  # asignado por el servidor
    assert body["privacy_notice_version"] == NOTICE
    assert len(body["dedupe_key"]) == 64
    assert captured["headers"]["apikey"] == SUPABASE_TEST_KEY
    assert "authorization" not in captured["headers"]
    assert "on_conflict=dedupe_key" in captured["url"]
    assert captured["headers"]["prefer"] == "resolution=ignore-duplicates,return=minimal"


def test_client_supplied_consent_at_is_rejected():
    client = TestClient(_app(_created))
    response = _post(client, {**VALID, "consent_at": "2000-01-01T00:00:00Z"})
    assert response.status_code == 422


def test_consent_must_be_true():
    client = TestClient(_app(_created))
    assert _post(client, {**VALID, "consent": False}).status_code == 422


def test_wrong_privacy_notice_version_is_rejected():
    client = TestClient(_app(_created))
    assert _post(client, {**VALID, "privacy_notice_version": "otra"}).status_code == 422


def test_invalid_email_is_rejected_without_echoing_input():
    client = TestClient(_app(_created))
    response = _post(client, {**VALID, "email": "no-es-correo"})
    assert response.status_code == 422
    assert "no-es-correo" not in response.text


def test_leads_disabled_returns_503_without_touching_database():
    def forbidden(request):
        raise AssertionError("no debe llamarse a Supabase con la captura desactivada")

    client = TestClient(_app(forbidden, leads_enabled=False))
    assert _post(client, VALID).status_code == 503


def test_missing_signature_is_rejected_when_secret_configured():
    client = TestClient(_app(_created))
    raw = json.dumps(VALID).encode()
    response = client.post(
        "/api/v1/leads", content=raw, headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 401


def test_production_without_gateway_secret_returns_503():
    client = TestClient(_app(_created, secret="", app_env="production"))
    raw = json.dumps(VALID).encode()
    response = client.post(
        "/api/v1/leads", content=raw, headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 503


def test_replayed_lead_request_is_rejected():
    client = TestClient(_app(_created))
    raw, headers = _signed(VALID)
    assert client.post("/api/v1/leads", content=raw, headers=headers).status_code == 201
    assert client.post("/api/v1/leads", content=raw, headers=headers).status_code == 401


def test_rate_limit_applies_per_signed_client_key():
    client = TestClient(_app(_created))
    statuses = []
    for i in range(6):
        # Cuerpo distinto en cada petición: firmas distintas, así no interviene la anti-repetición.
        raw, headers = _signed(
            {**VALID, "email": f"visitante{i}@example.test", "client_key": "visitor-1"}
        )
        statuses.append(client.post("/api/v1/leads", content=raw, headers=headers).status_code)
    assert statuses[:5] == [201] * 5
    assert statuses[5] == 429


def test_supabase_failure_returns_generic_error_without_secret_or_payload(caplog):
    def handler(request):
        return httpx.Response(500, json={"message": "internal detail"})

    client = TestClient(_app(handler))
    with caplog.at_level("WARNING"):
        response = _post(client, VALID)
    assert response.status_code == 503
    assert SUPABASE_TEST_KEY not in response.text
    assert SUPABASE_URL not in response.text
    assert "internal detail" not in response.text
    assert SUPABASE_TEST_KEY not in caplog.text
    assert "prueba.lead@example.test" not in caplog.text


def test_supabase_retries_transient_error_then_succeeds():
    attempts = []

    def handler(request):
        attempts.append(1)
        return httpx.Response(503) if len(attempts) == 1 else httpx.Response(201)

    client = TestClient(_app(handler))
    assert _post(client, VALID).status_code == 201
    assert len(attempts) == 2


def test_supabase_client_error_is_not_retried():
    attempts = []

    def handler(request):
        attempts.append(1)
        return httpx.Response(400, json={"message": "bad"})

    client = TestClient(_app(handler))
    assert _post(client, VALID).status_code == 503
    assert len(attempts) == 1


def test_supabase_timeout_is_reported_as_unavailable():
    def handler(request):
        raise httpx.ReadTimeout("timeout", request=request)

    client = TestClient(_app(handler))
    assert _post(client, VALID).status_code == 503


def test_lead_success_logs_event_without_personal_data(caplog):
    client = TestClient(_app(_created))
    with caplog.at_level("INFO"):
        _post(client, VALID)
    assert "lead_received" in caplog.text
    assert "prueba.lead@example.test" not in caplog.text
    assert "Persona de Prueba" not in caplog.text


def test_ready_is_ready_when_leads_disabled_without_contacting_supabase():
    def forbidden(request):
        raise AssertionError("ready no debe consultar Supabase con la captura desactivada")

    client = TestClient(_app(forbidden, leads_enabled=False))
    response = client.get("/api/v1/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_ready_reports_not_ready_without_details_when_supabase_fails():
    def handler(request):
        return httpx.Response(500)

    client = TestClient(_app(handler))
    response = client.get("/api/v1/ready")
    assert response.status_code == 503
    assert response.json() == {"status": "not_ready"}
    assert SUPABASE_TEST_KEY not in response.text
    assert SUPABASE_URL not in response.text


def test_ready_is_ready_when_supabase_reachable():
    client = TestClient(_app(lambda request: httpx.Response(200, json=[])))
    assert client.get("/api/v1/ready").status_code == 200


def test_supabase_client_without_config_fails_closed():
    settings = make_settings(supabase_url="", supabase_secret_key="")
    client = SupabaseRestClient(settings)
    assert client.configured is False


def test_client_identity_ignores_unsigned_client_key_in_development():
    settings = make_settings(internal_hmac_secret="")

    class _Req:
        class client:  # noqa: N801 - imitación mínima de request.client
            host = "10.0.0.5"

    assert client_identity(_Req, settings, "forged") == "sock:10.0.0.5"
