"""Verificación controlada de OpenRouter desde el backend. No imprime claves ni cuerpos de respuesta.

Uso (desde la carpeta backend):
    .venv/Scripts/python.exe scripts/check_openrouter.py          # solo configuración
    .venv/Scripts/python.exe scripts/check_openrouter.py --live   # una llamada real, con tope de tokens

La presencia de la clave no demuestra conexión: solo --live la comprueba.
"""

import asyncio
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import Settings  # noqa: E402
from app.integrations.openrouter_client import (  # noqa: E402
    ChatMessage,
    CompletionRequest,
    HttpOpenRouterClient,
    OpenRouterError,
    model_chain,
)

PROBE = "Responde solo con la palabra OK."


def print_config(settings: Settings) -> None:
    key_present = bool(settings.openrouter_api_key.get_secret_value())
    chain = model_chain(settings)
    print("== Configuración efectiva (sin valores secretos)")
    print(f"AGENT_DRY_RUN: {settings.agent_dry_run}")
    print(f"OPENROUTER_API_KEY presente: {key_present}")
    print(f"Modelo primario: {settings.openrouter_primary_model or '(vacío)'}")
    print(f"Modelo fallback: {settings.openrouter_fallback_model or '(vacío)'}")
    print(f"Cadena de modelos: {chain or '(vacía: no hay llamada posible)'}")
    print(f"Timeout por intento: {settings.openrouter_timeout_seconds} s")
    print(f"Presupuesto total de respuesta: {settings.agent_total_timeout_seconds} s")
    print(f"Máx. tokens de salida: {settings.openrouter_max_tokens}")
    print(f"Presupuesto diario: {settings.agent_daily_model_call_budget} llamadas, "
          f"{settings.agent_daily_token_budget} tokens")


async def live_probe(settings: Settings) -> int:
    if settings.agent_dry_run:
        print("\nPrueba real NO ejecutada: AGENT_DRY_RUN=true. Ponlo en false solo en el servidor.")
        return 2
    if not settings.openrouter_api_key.get_secret_value():
        print("\nPrueba real NO ejecutada: falta OPENROUTER_API_KEY en el entorno del servidor.")
        return 2
    if not model_chain(settings):
        print("\nPrueba real NO ejecutada: falta OPENROUTER_PRIMARY_MODEL.")
        return 2
    client = HttpOpenRouterClient(settings)
    request = CompletionRequest(
        messages=[ChatMessage(role="user", content=PROBE)],
        max_tokens=20,
        deadline=time.monotonic() + settings.agent_total_timeout_seconds,
    )
    started = time.monotonic()
    try:
        result = await client.complete(request)
    except OpenRouterError as exc:
        print(f"\nPrueba real FALLIDA: tipo={exc.kind} (sin detalle del proveedor).")
        return 1
    latency = int((time.monotonic() - started) * 1000)
    print("\n== Prueba real de OpenRouter")
    print(f"Respuesta recibida: {result.dry_run is False}")
    print(f"Modelo que respondió: {result.model}")
    print(f"Intento: {result.attempt} (fallback usado: {result.fallback_used})")
    print(f"Tokens: {result.tokens}")
    print(f"Latencia: {latency} ms")
    print(f"Texto (recortado): {result.text.strip()[:40]!r}")
    return 0


def main() -> int:
    settings = Settings()
    print_config(settings)
    if "--live" not in sys.argv:
        print("\nSolo configuración. Usa --live para una llamada real.")
        return 0
    return asyncio.run(live_probe(settings))


if __name__ == "__main__":
    raise SystemExit(main())
