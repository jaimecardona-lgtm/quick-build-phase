"""Router de la versión 1 de la API."""

from fastapi import APIRouter

from app.api.v1 import ai, config, health, leads, ready, roi

router = APIRouter()
router.include_router(health.router)
router.include_router(config.router)
router.include_router(ai.router)
router.include_router(roi.router)
router.include_router(leads.router)
router.include_router(ready.router)
