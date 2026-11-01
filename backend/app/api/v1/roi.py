"""Cálculo de ROI determinista. No usa LLM ni almacena datos."""

from fastapi import APIRouter

from app.services.roi_service import RoiInput, RoiResult, calculate

router = APIRouter(prefix="/roi", tags=["roi"])


@router.post("/calculate", response_model=RoiResult)
def calculate_roi(data: RoiInput) -> RoiResult:
    return calculate(data)
