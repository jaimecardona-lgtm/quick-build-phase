from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import make_settings

FAKE_KEY = "sk-or-test-FAKE-0000000000"
FRONTEND_ORIGIN = "http://localhost:5173"


def test_health_returns_typed_ok_without_openrouter_config() -> None:
    client = TestClient(create_app(make_settings()))

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "logixtic-api", "version": "0.1.0"}


def test_config_public_exposes_no_secret_values() -> None:
    client = TestClient(create_app(make_settings(openrouter_api_key=FAKE_KEY)))

    response = client.get("/api/v1/config/public")

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"app_env", "api_version", "agent_dry_run", "openrouter_configured"}
    assert body["openrouter_configured"] is True
    assert body["agent_dry_run"] is True
    assert FAKE_KEY not in response.text


def test_cors_allows_configured_origin() -> None:
    client = TestClient(create_app(make_settings()))

    response = client.get("/api/v1/health", headers={"Origin": FRONTEND_ORIGIN})

    assert response.headers.get("access-control-allow-origin") == FRONTEND_ORIGIN
    assert "access-control-allow-credentials" not in response.headers


def test_cors_rejects_unlisted_origin() -> None:
    client = TestClient(create_app(make_settings()))

    response = client.get("/api/v1/health", headers={"Origin": "https://evil.example"})

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers
