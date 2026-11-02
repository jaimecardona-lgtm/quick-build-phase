"""Logging estructurado en JSON con salida allowlisted.

Solo se publican los campos extra listados en _ALLOWED_EXTRA. No se registran claves, tokens,
sesiones ni datos personales: el código no debe pasar esos valores a los loggers.
"""

import json
import logging
import sys
from datetime import UTC, datetime

# Métricas técnicas del agente: sin texto de conversación, sin datos personales ni secretos.
_ALLOWED_EXTRA = frozenset(
    {
        "event",
        "app_env",
        "effective_model",
        "fallback_used",
        "judge_status",
        "engagement_status",
        "latency_ms",
        "tokens",
        "degradation_reason",
        "answer_kind",
        "primary_error_kind",
        "finish_reason",
        "has_reasoning",
    }
)
_HANDLER_NAME = "logixtic-json"
_RESERVED_ATTRS = frozenset(vars(logging.makeLogRecord({}))) | {"message", "asctime"}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, object] = {
            "ts": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key, value in vars(record).items():
            if key in _ALLOWED_EXTRA and key not in _RESERVED_ATTRS:
                payload[key] = value
        return json.dumps(payload, ensure_ascii=False, default=str)


def configure_logging(level: int = logging.INFO) -> None:
    root = logging.getLogger()
    if any(handler.name == _HANDLER_NAME for handler in root.handlers):
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.set_name(_HANDLER_NAME)
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
    root.setLevel(level)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
