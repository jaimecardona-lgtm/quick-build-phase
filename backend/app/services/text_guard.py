"""Utilidades deterministas: redacción de datos personales y comprobación de afirmaciones.

- redact_pii: se aplica antes de enviar cualquier texto del visitante a un modelo.
- unsupported_claims: compara cifras y promesas de una respuesta con las fuentes aprobadas.
- simulated_access: detecta frases que harían creer que el asistente ve embarques reales.
"""

import re

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
PHONE_RE = re.compile(r"(?<!\w)\+?\d[\d \-().]{7,}\d(?!\w)")
NUMBER_RE = re.compile(r"\d+(?:[.,]\d+)*")

# Promesas o garantías que nunca deben aparecer salvo que estén en una fuente aprobada.
PROMISE_RE = re.compile(
    r"\b(garantiz\w*|garantia|garantido|guarantee[sd]?|risk[- ]free|sin riesgo|"
    r"siempre disponible|always available|100\s?%|sin l[ií]mite|unlimited|"
    r"ahorr\w* (hasta|de hasta|up to)|economiz\w* (até|hasta)|"
    r"el mejor|el m[aá]s r[aá]pido|the best|the fastest|o melhor)\b",
    re.IGNORECASE,
)

# Frases que simulan acceso a embarques, ubicaciones o ETA reales.
SIMULATED_ACCESS_RE = re.compile(
    r"\b((tu|su|mi|sua|seu|minha) (embarque|carga|contenedor|env[ií]o|mercanc[ií]a|shipment|"
    r"cargo|container)\w* (est[áa]|llega|sale|ubicad\w*|chega|saiu|is|arrives|arrived)|"
    r"ubicaci[oó]n actual|localiza[cç][aã]o atual|current location|eta (es|ser[aá]|is)|"
    r"lo estamos rastreando|estamos rastreando|we are tracking)\b",
    re.IGNORECASE,
)


def redact_pii(text: str) -> str:
    """Sustituye correos y teléfonos por marcadores. No modifica el resto del texto."""
    redacted = EMAIL_RE.sub("[correo]", text)
    return PHONE_RE.sub("[telefono]", redacted)


def _numbers(text: str) -> set[str]:
    return {m.replace(",", ".") for m in NUMBER_RE.findall(text)}


def unsupported_claims(answer: str, sources: list[str]) -> list[str]:
    """Lista de problemas: cifras o promesas en la respuesta que las fuentes no contienen."""
    source_text = "\n".join(sources)
    issues: list[str] = []

    unsupported_numbers = {n for n in _numbers(answer) - _numbers(source_text) if len(n) >= 2}
    if unsupported_numbers:
        issues.append(f"cifras no respaldadas: {', '.join(sorted(unsupported_numbers))}")

    source_lower = source_text.lower()
    for match in PROMISE_RE.finditer(answer):
        term = match.group(0).lower()
        if term not in source_lower:
            issues.append(f"promesa no autorizada: {term}")

    for match in SIMULATED_ACCESS_RE.finditer(answer):
        issues.append(f"simulación de acceso operativo: {match.group(0).lower()}")
    return issues


def has_claim_signal(answer: str) -> bool:
    """¿Vale la pena una segunda verificación con modelo? (cifras, promesas o superlativos)."""
    return bool(NUMBER_RE.search(answer) or PROMISE_RE.search(answer))
