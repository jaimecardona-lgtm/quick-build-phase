"""GET /api/v1/health: liveness del proceso. No consulta servicios externos."""

from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from app import __version__

SERVICE_NAME = "logixtic-api"

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    version: str


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service=SERVICE_NAME, version=__version__)
