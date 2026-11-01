"""ROI determinista con Decimal: aritmetica exacta, supuestos explicitos y validacion."""

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import create_app
from app.services.roi_service import RoiInput, calculate
from tests.conftest import make_settings


def test_gross_and_net_saving_exact():
    result = calculate(
        RoiInput(
            monthly_operations=100,
            manual_hours_per_operation=Decimal("2"),
            loaded_hourly_cost=Decimal("20"),
            reduction_assumption_pct=Decimal("25"),
            logixtic_monthly_cost=Decimal("300"),
        )
    )
    assert result.gross_monthly_saving == Decimal("1000.00")
    assert result.net_monthly_saving == Decimal("700.00")
    assert result.assumptions_version == "roi-v1"


def test_net_is_none_without_software_cost():
    result = calculate(
        RoiInput(
            monthly_operations=10,
            manual_hours_per_operation=Decimal("1.5"),
            loaded_hourly_cost=Decimal("10"),
            reduction_assumption_pct=Decimal("50"),
        )
    )
    assert result.gross_monthly_saving == Decimal("75.00")
    assert result.net_monthly_saving is None


def test_rounding_half_up_to_cents():
    result = calculate(
        RoiInput(
            monthly_operations=1,
            manual_hours_per_operation=Decimal("1"),
            loaded_hourly_cost=Decimal("1"),
            reduction_assumption_pct=Decimal("33.335"),
        )
    )
    assert result.gross_monthly_saving == Decimal("0.33")


@pytest.mark.parametrize(
    ("field", "value"),
    [("monthly_operations", 0), ("reduction_assumption_pct", 101), ("loaded_hourly_cost", -1)],
)
def test_invalid_inputs_rejected(field, value):
    data = {
        "monthly_operations": 10,
        "manual_hours_per_operation": Decimal("1"),
        "loaded_hourly_cost": Decimal("10"),
        "reduction_assumption_pct": Decimal("10"),
    }
    data[field] = value
    with pytest.raises(ValidationError):
        RoiInput(**data)


def test_roi_endpoint_is_deterministic_and_uses_no_llm():
    client = TestClient(create_app(make_settings(app_env="development")))
    body = {
        "monthly_operations": 100,
        "manual_hours_per_operation": "2",
        "loaded_hourly_cost": "20",
        "reduction_assumption_pct": "25",
    }
    first = client.post("/api/v1/roi/calculate", json=body).json()
    second = client.post("/api/v1/roi/calculate", json=body).json()
    assert first == second
    assert first["gross_monthly_saving"] == "1000.00"
    invalid = client.post("/api/v1/roi/calculate", json={**body, "reduction_assumption_pct": 150})
    assert invalid.status_code == 422
