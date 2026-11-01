"""Cálculo de ahorro determinista (sin LLM).
Usa Decimal y solo los supuestos que entrega el usuario.

No hay valores por defecto de ahorro: el porcentaje de reducción es un supuesto
explícito. El resultado
es una estimación ilustrativa, no una promesa comercial ni un dato validado por Logixtic.
"""

from decimal import ROUND_HALF_UP, Decimal

from pydantic import BaseModel, Field

ASSUMPTIONS_VERSION = "roi-v1"
CENT = Decimal("0.01")


class RoiInput(BaseModel):
    monthly_operations: int = Field(gt=0, le=100_000)
    manual_hours_per_operation: Decimal = Field(gt=0, le=200)
    loaded_hourly_cost: Decimal = Field(gt=0, le=10_000)
    reduction_assumption_pct: Decimal = Field(ge=0, le=100)
    logixtic_monthly_cost: Decimal | None = Field(default=None, ge=0, le=10_000_000)


class RoiResult(BaseModel):
    gross_monthly_saving: Decimal
    net_monthly_saving: Decimal | None
    assumptions_version: str
    note: str


def _cents(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def calculate(data: RoiInput) -> RoiResult:
    hours = Decimal(data.monthly_operations) * data.manual_hours_per_operation
    gross = _cents(hours * data.loaded_hourly_cost * data.reduction_assumption_pct / Decimal(100))
    net = None if data.logixtic_monthly_cost is None else _cents(gross - data.logixtic_monthly_cost)
    return RoiResult(
        gross_monthly_saving=gross,
        net_monthly_saving=net,
        assumptions_version=ASSUMPTIONS_VERSION,
        note=(
            "Estimación con los supuestos ingresados por el usuario. "
            "No es una promesa de resultados."
        ),
    )
