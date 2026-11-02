"""GET /api/v1/ready: preparación para recibir tráfico.

Comprueba Supabase solo si la captura de leads está activa.

No expone URLs, claves, nombres de tablas ni detalles de error.
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter(tags=["health"])


@router.get("/ready")
async def ready(request: Request) -> JSONResponse:
    settings = request.app.state.settings
    supabase = request.app.state.supabase
    if not settings.leads_enabled:
        return JSONResponse({"status": "ready"})
    if supabase.configured and await supabase.ping():
        return JSONResponse({"status": "ready"})
    return JSONResponse({"status": "not_ready"}, status_code=503)
