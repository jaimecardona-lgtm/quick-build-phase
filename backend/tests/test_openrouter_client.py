import asyncio

import httpx

from app.integrations.openrouter_client import (
    DRY_RUN_MODEL,
    ChatMessage,
    CompletionRequest,
    DryRunOpenRouterClient,
    build_openrouter_client,
)
from tests.conftest import make_settings

REQUEST = CompletionRequest(messages=[ChatMessage(role="user", content="Hola")])


def _forbidden_transport(calls: list[httpx.Request]) -> httpx.MockTransport:
    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        raise AssertionError("Se intentó una llamada de red en modo dry-run.")

    return httpx.MockTransport(handler)


def test_dry_run_is_default_and_makes_no_network_call() -> None:
    calls: list[httpx.Request] = []
    settings = make_settings(
        openrouter_api_key="sk-or-test-FAKE-0000000000",
        openrouter_primary_model="fake/model",
    )

    client = build_openrouter_client(settings, transport=_forbidden_transport(calls))
    result = asyncio.run(client.complete(REQUEST))

    assert isinstance(client, DryRunOpenRouterClient)
    assert result.dry_run is True
    assert result.model == DRY_RUN_MODEL
    assert result.text.startswith("[DRY-RUN]")
    assert calls == []


def test_dry_run_is_selected_when_env_has_no_openrouter_config() -> None:
    settings = make_settings()

    assert isinstance(build_openrouter_client(settings), DryRunOpenRouterClient)
