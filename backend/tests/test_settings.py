import pytest
from pydantic import ValidationError

from app.core.config import Settings
from tests.conftest import make_settings


def test_defaults_are_safe_and_offline() -> None:
    settings = make_settings()

    assert settings.app_env == "development"
    assert settings.api_host == "127.0.0.1"
    assert settings.api_port == 8000
    assert settings.cors_allow_origins == ["http://localhost:3000", "http://localhost:5173"]
    assert settings.openrouter_api_key.get_secret_value() == ""
    assert settings.agent_dry_run is True


def test_cors_origins_parsed_from_comma_separated_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ALLOW_ORIGINS", "http://a.test:3000, https://b.test")

    settings = Settings(_env_file=None)

    assert settings.cors_allow_origins == ["http://a.test:3000", "https://b.test"]


def test_secret_key_is_not_shown_in_repr() -> None:
    fake_key = "sk-or-test-FAKE-0000000000"
    settings = make_settings(openrouter_api_key=fake_key)

    assert fake_key not in repr(settings)
    assert fake_key not in str(settings.model_dump())


@pytest.mark.parametrize(
    "origins",
    ["*", "https://*.example.com", "http://a.test,*"],
)
def test_wildcard_cors_is_rejected(origins: str) -> None:
    with pytest.raises(ValidationError):
        make_settings(cors_allow_origins=origins)


@pytest.mark.parametrize(
    "origin",
    [
        "ftp://files.test",
        "javascript:alert(1)",
        "http://a.test/path",
        "https://a.test?x=1",
        "https://user@a.test",
        "localhost:3000",
    ],
)
def test_non_http_or_non_origin_values_are_rejected(origin: str) -> None:
    with pytest.raises(ValidationError):
        make_settings(cors_allow_origins=origin)


@pytest.mark.parametrize("temperature", [-0.1, 2.5])
def test_temperature_must_be_between_0_and_2(temperature: float) -> None:
    with pytest.raises(ValidationError):
        make_settings(openrouter_temperature=temperature)


@pytest.mark.parametrize(
    "overrides",
    [{"openrouter_max_tokens": 0}, {"openrouter_timeout_seconds": 0}, {"api_port": 0}],
)
def test_non_positive_limits_are_rejected(overrides: dict[str, float]) -> None:
    with pytest.raises(ValidationError):
        make_settings(**overrides)


def test_optional_openrouter_vars_do_not_block_startup(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in (
        "OPENROUTER_API_KEY",
        "OPENROUTER_PRIMARY_MODEL",
        "OPENROUTER_FALLBACK_MODEL",
    ):
        monkeypatch.setenv(name, "")

    settings = Settings(_env_file=None)

    assert settings.openrouter_primary_model == ""
    assert settings.openrouter_fallback_model == ""


def test_agent_dry_run_can_be_disabled_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AGENT_DRY_RUN", "false")

    assert Settings(_env_file=None).agent_dry_run is False
