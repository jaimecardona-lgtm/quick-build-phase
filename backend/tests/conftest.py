from typing import Any

from app.core.config import Settings


def make_settings(**overrides: Any) -> Settings:
    """Settings aislados: ignoran cualquier .env local del desarrollador."""
    return Settings(_env_file=None, **overrides)
