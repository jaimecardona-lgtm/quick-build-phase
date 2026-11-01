"""Agente en tres idiomas: fuentes del idioma pedido, rechazos y textos localizados.

Sin red.
"""

from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import make_settings


def _client():
    return TestClient(create_app(make_settings(app_env="development")))


def test_english_question_cites_english_sources():
    data = (
        _client()
        .post(
            "/api/v1/ai/chat",
            json={
                "message": "What is Logixtic and how does it help freight forwarders?",
                "locale": "en",
            },
        )
        .json()
    )
    assert data["sources"]
    assert all(source.startswith("en-") for source in data["sources"])


def test_portuguese_question_cites_portuguese_sources():
    data = (
        _client()
        .post(
            "/api/v1/ai/chat",
            json={
                "message": "O que é a Logixtic e como ajuda agentes de carga?",
                "locale": "pt-BR",
            },
        )
        .json()
    )
    assert data["sources"]
    assert all(source.startswith("pt-faq-") for source in data["sources"])


def test_tracking_refusal_is_localized():
    client = _client()
    en = client.post(
        "/api/v1/ai/chat", json={"message": "Where is my shipment in real time?", "locale": "en"}
    ).json()
    assert en["refused"] is True
    assert "don't have access" in en["text"]
    pt = client.post(
        "/api/v1/ai/chat",
        json={"message": "Qual o rastreamento em tempo real da minha carga?", "locale": "pt-BR"},
    ).json()
    assert pt["refused"] is True
    assert "Não tenho acesso" in pt["text"]


def test_unknown_locale_rejected():
    response = _client().post(
        "/api/v1/ai/chat", json={"message": "What is Logixtic?", "locale": "fr"}
    )
    assert response.status_code == 422
