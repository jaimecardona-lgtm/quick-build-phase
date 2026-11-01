"""Contrato mínimo del limitador de frecuencia (para tipar el estado de la aplicación)."""

from typing import Protocol


class RateLimiterLike(Protocol):
    def allow(self, key: str, now: float | None = None) -> bool: ...
