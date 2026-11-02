"""Respuestas conversacionales deterministas (saludos, cortesía, despedidas, ambigüedad).

No llaman a ningún modelo ni inventan funciones: solo orientan al visitante hacia el contenido
comercial aprobado o hacia una demostración. Se usan cuando el mensaje no es una consulta
comercial con fuente aprobada.
"""

import re
import unicodedata
from typing import Literal

SocialIntent = Literal[
    "greeting", "how_are_you", "thanks", "farewell", "clarification", "ambiguous"
]

_PATTERNS: dict[SocialIntent, re.Pattern[str]] = {
    "greeting": re.compile(
        r"^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hi|hello|hey there|"
        r"good morning|good afternoon|good evening|oi|ola|bom dia|boa tarde|boa noite)\b"
    ),
    "how_are_you": re.compile(
        r"\b(como estas|como vas|que tal|como esta usted|how are you|how are things|"
        r"how's it going|whats up|tudo bem|como vai|como voce esta|como esta)\b"
    ),
    "thanks": re.compile(
        r"\b(gracias|muchas gracias|thanks|thank you|thx|obrigad[oa]|muito obrigad[oa]|valeu)\b"
    ),
    "farewell": re.compile(
        r"\b(adios|hasta luego|hasta pronto|chao|nos vemos|bye|goodbye|see you|tchau|"
        r"ate logo|ate mais|ate breve)\b"
    ),
    "clarification": re.compile(
        r"\b(no entiendo|no te entiendo|explicame|puedes aclarar|repite|que quieres decir|"
        r"what do you mean|can you explain|i don't understand|do not understand|"
        r"nao entendi|pode explicar|explica melhor|o que voce quer dizer)\b"
    ),
    "ambiguous": re.compile(
        r"^(ayuda|help|ajuda|que puedes hacer|que haces|what can you do|what do you do|"
        r"o que voce faz|o que voce pode fazer|menu|opciones|options|opcoes)$"
    ),
}

_TEXTS: dict[str, dict[SocialIntent, str]] = {
    "es": {
        "greeting": (
            "¡Hola! Soy el asistente comercial de Logixtic. Puedo explicarte funciones y "
            "casos de uso aprobados, o ayudarte a agendar una demo personalizada. "
            "¿Qué te gustaría saber?"
        ),
        "how_are_you": (
            "Muy bien, gracias por preguntar. Estoy listo para ayudarte con Logixtic. "
            "¿Qué te gustaría saber sobre la plataforma?"
        ),
        "thanks": (
            "Con gusto. Si quieres, puedo explicarte otra función aprobada o ayudarte a "
            "agendar una demo personalizada."
        ),
        "farewell": (
            "¡Hasta pronto! Si más adelante quieres revisar tu caso, puedes agendar una demo "
            "personalizada desde esta web."
        ),
        "clarification": (
            "Claro. Puedo responder preguntas sobre las funciones aprobadas de Logixtic. "
            "Formula tu pregunta con otras palabras, por ejemplo: «¿qué es Logixtic?» o "
            "«¿para quién es la plataforma?»."
        ),
        "ambiguous": (
            "Puedo ayudarte con: qué es Logixtic, sus funciones aprobadas, cómo es la "
            "implementación o cómo agendar una demo personalizada. ¿Cuál te interesa?"
        ),
    },
    "en": {
        "greeting": (
            "Hello! I'm Logixtic's sales assistant. I can explain approved features and use "
            "cases, or help you book a personalized demo. What would you like to know?"
        ),
        "how_are_you": (
            "I'm doing well, thanks for asking. I'm ready to help you with Logixtic. "
            "What would you like to know about the platform?"
        ),
        "thanks": (
            "You're welcome. I can explain another approved feature or help you book a "
            "personalized demo."
        ),
        "farewell": (
            "See you soon! If you want to review your case later, you can book a personalized "
            "demo from this website."
        ),
        "clarification": (
            "Sure. I can answer questions about Logixtic's approved features. Try rephrasing "
            'your question, for example: "what is Logixtic?" or "who is the platform for?".'
        ),
        "ambiguous": (
            "I can help with: what Logixtic is, its approved features, how implementation "
            "works, or how to book a personalized demo. Which one interests you?"
        ),
    },
    "pt-BR": {
        "greeting": (
            "Olá! Sou o assistente comercial da Logixtic. Posso explicar funções e casos de uso "
            "aprovados ou ajudar você a agendar uma demonstração personalizada. "
            "O que você gostaria de saber?"
        ),
        "how_are_you": (
            "Estou bem, obrigado por perguntar. Estou pronto para ajudar com a Logixtic. "
            "O que você gostaria de saber sobre a plataforma?"
        ),
        "thanks": (
            "De nada. Posso explicar outra função aprovada ou ajudar você a agendar uma "
            "demonstração personalizada."
        ),
        "farewell": (
            "Até logo! Se quiser revisar seu caso depois, você pode agendar uma demonstração "
            "personalizada por este site."
        ),
        "clarification": (
            "Claro. Posso responder perguntas sobre as funções aprovadas da Logixtic. Tente "
            "reformular a pergunta, por exemplo: «o que é a Logixtic?» ou "
            "«para quem é a plataforma?»."
        ),
        "ambiguous": (
            "Posso ajudar com: o que é a Logixtic, suas funções aprovadas, como é a implementação "
            "ou como agendar uma demonstração personalizada. Qual deles interessa a você?"
        ),
    },
}

# Mensajes cortos que solo son saludo, cortesía, etc. Por encima de este número de palabras,
# el mensaje se trata como consulta comercial si hay fuente aprobada.
MAX_SOCIAL_WORDS = 5


def _normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFKD", text.lower())
    ascii_text = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    cleaned = re.sub(r"[^a-z0-9' ]+", " ", ascii_text)
    return re.sub(r"\s+", " ", cleaned).strip()


def classify_social(message: str) -> SocialIntent | None:
    """Intención social del mensaje, o None si parece una consulta de contenido."""
    normalized = _normalize(message)
    if not normalized:
        return "ambiguous"
    if len(normalized.split()) > MAX_SOCIAL_WORDS:
        return None
    for intent in ("ambiguous", "clarification", "farewell", "thanks", "how_are_you", "greeting"):
        if _PATTERNS[intent].search(normalized):  # type: ignore[index]
            return intent  # type: ignore[return-value]
    return None


def social_text(intent: SocialIntent, locale: str) -> str:
    texts = _TEXTS.get(locale, _TEXTS["es"])
    return texts[intent]
