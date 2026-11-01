"""Herramientas del agente público en lista blanca.
Ninguna consulta datos de tenants ni embarques reales.

- search_public_content: recupera fragmentos aprobados.
- calculate_roi: cálculo determinista con supuestos explícitos.
- request_demo: no guarda datos; devuelve la acción de demo existente y exige consentimiento.
"""

from collections.abc import Callable
from typing import Any

from pydantic import BaseModel, Field, ValidationError

from app.services.knowledge_service import KnowledgeBase
from app.services.roi_service import RoiInput, calculate


class ToolNotAllowed(LookupError):
    """La herramienta no está en la lista blanca."""


class SearchArgs(BaseModel):
    query: str = Field(min_length=2, max_length=300)
    limit: int = Field(default=3, ge=1, le=5)


class DemoArgs(BaseModel):
    consent: bool


def search_public_content(knowledge: KnowledgeBase, args: dict[str, Any]) -> dict[str, Any]:
    parsed = SearchArgs.model_validate(args)
    hits = knowledge.search(parsed.query, parsed.limit)
    return {"knowledge_version": knowledge.version, "hits": [h.model_dump() for h in hits]}


def calculate_roi_tool(_: KnowledgeBase, args: dict[str, Any]) -> dict[str, Any]:
    result = calculate(RoiInput.model_validate(args))
    return result.model_dump(mode="json")


def request_demo(_: KnowledgeBase, args: dict[str, Any]) -> dict[str, Any]:
    parsed = DemoArgs.model_validate(args)
    if not parsed.consent:
        return {"status": "consent_required"}
    # No se almacena nada aquí: la demo se agenda con el CTA existente del sitio.
    return {"status": "use_demo_cta"}


TOOLS: dict[str, Callable[[KnowledgeBase, dict[str, Any]], dict[str, Any]]] = {
    "search_public_content": search_public_content,
    "calculate_roi": calculate_roi_tool,
    "request_demo": request_demo,
}


def invoke(name: str, knowledge: KnowledgeBase, args: dict[str, Any]) -> dict[str, Any]:
    tool = TOOLS.get(name)
    if tool is None:
        raise ToolNotAllowed(name)
    try:
        return tool(knowledge, args)
    except ValidationError:
        raise
