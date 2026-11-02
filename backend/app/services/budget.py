"""Presupuesto diario (UTC) de llamadas y tokens a modelos gratuitos o de pago.

Memoria local por proceso: un contador por instancia. Con varias instancias el límite real es
N × presupuesto; para producción debe moverse a un almacén compartido (ver backlog de staging).
"""

import threading
from collections.abc import Callable
from datetime import UTC, datetime


class DailyBudget:
    def __init__(
        self,
        call_limit: int,
        token_limit: int,
        clock: Callable[[], datetime] | None = None,
    ) -> None:
        self._call_limit = call_limit
        self._token_limit = token_limit
        self._clock = clock or (lambda: datetime.now(UTC))
        self._lock = threading.Lock()
        self._day = self._today()
        self._calls = 0
        self._tokens = 0

    def _today(self) -> str:
        return self._clock().strftime("%Y-%m-%d")

    def _roll(self) -> None:
        day = self._today()
        if day != self._day:
            self._day = day
            self._calls = 0
            self._tokens = 0

    def try_reserve_call(self) -> bool:
        """Reserva una llamada si queda cupo. Devuelve False si el presupuesto está agotado."""
        with self._lock:
            self._roll()
            if self._calls >= self._call_limit or self._tokens >= self._token_limit:
                return False
            self._calls += 1
            return True

    def record_tokens(self, tokens: int | None) -> None:
        if not tokens or tokens < 0:
            return
        with self._lock:
            self._roll()
            self._tokens += tokens

    def exhausted(self) -> bool:
        with self._lock:
            self._roll()
            return self._calls >= self._call_limit or self._tokens >= self._token_limit

    def snapshot(self) -> dict[str, int | str]:
        with self._lock:
            self._roll()
            return {
                "day": self._day,
                "calls": self._calls,
                "tokens": self._tokens,
                "call_limit": self._call_limit,
                "token_limit": self._token_limit,
            }


class CtaCooldown:
    """Como máximo un CTA de demo por sesión dentro de la ventana. Evita insistencia comercial."""

    def __init__(self, minutes: int, clock: Callable[[], float] | None = None) -> None:
        self._seconds = minutes * 60
        self._clock = clock or (lambda: datetime.now(UTC).timestamp())
        self._last: dict[str, float] = {}
        self._lock = threading.Lock()

    def allow(self, session_id: str | None) -> bool:
        if not session_id:
            return False
        now = self._clock()
        with self._lock:
            last = self._last.get(session_id)
            if last is not None and now - last < self._seconds:
                return False
            self._last[session_id] = now
            return True


class CreditBudget:
    """Presupuesto diario (UTC) de créditos de un proveedor externo (p. ej. Tavily)."""

    def __init__(self, daily_limit: float, clock: Callable[[], datetime] | None = None) -> None:
        self._limit = float(daily_limit)
        self._clock = clock or (lambda: datetime.now(UTC))
        self._lock = threading.Lock()
        self._day = self._clock().strftime("%Y-%m-%d")
        self._spent = 0.0

    def try_spend(self, credits: float) -> bool:
        with self._lock:
            day = self._clock().strftime("%Y-%m-%d")
            if day != self._day:
                self._day, self._spent = day, 0.0
            if self._spent + credits > self._limit:
                return False
            self._spent += credits
            return True

    def refund(self, credits: float) -> None:
        with self._lock:
            self._spent = max(0.0, self._spent - credits)

    def snapshot(self) -> dict[str, float | str]:
        with self._lock:
            return {"day": self._day, "spent": self._spent, "limit": self._limit}
