/*
 * Etiquetas de interfaz del widget Logix Web. Son interfaz técnica, no copy comercial aprobado.
 * Viven fuera de los componentes del sitio para no alterar la verificación de copy.
 */
import type { Locale } from "@/lib/i18n";

export type WidgetLang = "es" | "en" | "pt";

export const WIDGET_LABELS: Record<
  WidgetLang,
  {
    open: string;
    greeting: string;
    voiceOn: string;
    voiceOff: string;
    offer: string;
    offerYes: string;
    offerNo: string;
    title: string;
    close: string;
    tabChat: string;
    tabRoi: string;
    suggestions: string;
    placeholder: string;
    send: string;
    thinking: string;
    sources: string;
    approvedSource: string;
    modeDry: string;
    modeReal: string;
    modeDegraded: string;
    modeUnavailable: string;
    retry: string;
    errUnavailable: string;
    errRateLimited: string;
    errInvalid: string;
    errMisconfigured: string;
    errGeneric: string;
    roiTitle: string;
    roiOps: string;
    roiHours: string;
    roiCost: string;
    roiReduction: string;
    roiSoftware: string;
    roiCalculate: string;
    roiGross: string;
    roiNet: string;
    roiNote: string;
    roiVersion: string;
    intro: string;
  }
> = {
  es: {
    open: "Preguntar a Logix Web",
    greeting: "¡Hola! Te saluda Logix. ¿Cómo puedo ayudarte?",
    voiceOn: "Activar voz",
    voiceOff: "Silenciar voz",
    offer: "¡Excelente! Si quieres, puedo ponerte en contacto con un asesor de Logixtic para revisar las necesidades de tu operación. ¿Te gustaría hablar con él?",
    offerYes: "Hablar con un asesor",
    offerNo: "Seguir preguntando",
    title: "Logix Web",
    close: "Cerrar",
    tabChat: "Consulta",
    tabRoi: "Cálculo de ROI",
    suggestions: "Preguntas sugeridas",
    placeholder: "Escribe tu pregunta",
    send: "Enviar",
    thinking: "Consultando contenido aprobado…",
    sources: "Fuentes aprobadas",
    approvedSource: "Contenido aprobado",
    modeDry: "DRY-RUN · respuesta del contenido aprobado, sin modelo real",
    modeReal: "Modelo real",
    modeDegraded: "Respuesta del contenido aprobado (modelo no disponible)",
    modeUnavailable: "Problema temporal de conexión",
    retry: "Reintentar",
    errUnavailable: "El asistente no está disponible en este momento. Puedes agendar una demo.",
    errRateLimited: "Hiciste muchas consultas seguidas. Intenta de nuevo en un minuto.",
    errInvalid: "Revisa tu mensaje e inténtalo de nuevo.",
    errMisconfigured: "El asistente aún no está configurado para este entorno.",
    errGeneric: "No pudimos responder. Inténtalo de nuevo.",
    roiTitle: "Estimación con tus supuestos",
    roiOps: "Operaciones al mes",
    roiHours: "Horas manuales por operación",
    roiCost: "Costo horario cargado",
    roiReduction: "Reducción supuesta (%)",
    roiSoftware: "Costo mensual de Logixtic (opcional)",
    roiCalculate: "Calcular",
    roiGross: "Ahorro bruto mensual",
    roiNet: "Ahorro neto mensual",
    roiNote:
      "Estimación ilustrativa con los supuestos que ingresas. No es una promesa de resultados.",
    roiVersion: "Versión de supuestos",
    intro: "Soy Logix, tu asistente inteligente. Descubre cómo Logixtic conecta tu operación comercial, logística y financiera. ¿Qué te gustaría conocer?",
  },
  en: {
    open: "Ask Logix Web",
    greeting: "Hi! Logix says hello. How can I help you?",
    voiceOn: "Turn voice on",
    voiceOff: "Mute voice",
    offer: "Great! If you want, I can connect you with a Logixtic advisor to review your operation's needs. Would you like to talk to them?",
    offerYes: "Talk to an advisor",
    offerNo: "Keep asking",
    title: "Logix Web",
    close: "Close",
    tabChat: "Ask",
    tabRoi: "ROI estimate",
    suggestions: "Suggested questions",
    placeholder: "Type your question",
    send: "Send",
    thinking: "Checking approved content…",
    sources: "Approved sources",
    approvedSource: "Approved content",
    modeDry: "DRY-RUN · answer from approved content, no live model",
    modeReal: "Live model",
    modeDegraded: "Answer from approved content (model unavailable)",
    modeUnavailable: "Temporary connection issue",
    retry: "Retry",
    errUnavailable: "The assistant is not available right now. You can book a demo.",
    errRateLimited: "Too many questions in a row. Try again in a minute.",
    errInvalid: "Check your message and try again.",
    errMisconfigured: "The assistant is not configured for this environment yet.",
    errGeneric: "We couldn't answer. Please try again.",
    roiTitle: "Estimate with your assumptions",
    roiOps: "Operations per month",
    roiHours: "Manual hours per operation",
    roiCost: "Loaded hourly cost",
    roiReduction: "Assumed reduction (%)",
    roiSoftware: "Logixtic monthly cost (optional)",
    roiCalculate: "Calculate",
    roiGross: "Gross monthly saving",
    roiNet: "Net monthly saving",
    roiNote: "Illustrative estimate with the assumptions you enter. Not a promise of results.",
    roiVersion: "Assumptions version",
    intro: "I'm Logix, your smart assistant. Discover how Logixtic connects your commercial, logistics and financial operations. What would you like to know?",
  },
  pt: {
    open: "Perguntar ao Logix Web",
    greeting: "Olá! A Logix te cumprimenta. Como posso ajudar?",
    voiceOn: "Ativar voz",
    voiceOff: "Silenciar voz",
    offer: "Excelente! Se quiser, posso colocá-lo em contato com um consultor da Logixtic para revisar as necessidades da sua operação. Gostaria de falar com ele?",
    offerYes: "Falar com um consultor",
    offerNo: "Continuar perguntando",
    title: "Logix Web",
    close: "Fechar",
    tabChat: "Consulta",
    tabRoi: "Cálculo de ROI",
    suggestions: "Perguntas sugeridas",
    placeholder: "Escreva sua pergunta",
    send: "Enviar",
    thinking: "Consultando conteúdo aprovado…",
    sources: "Fontes aprovadas",
    approvedSource: "Conteúdo aprovado",
    modeDry: "DRY-RUN · resposta do conteúdo aprovado, sem modelo real",
    modeReal: "Modelo real",
    modeDegraded: "Resposta do conteúdo aprovado (modelo indisponível)",
    modeUnavailable: "Problema temporário de conexão",
    retry: "Tentar novamente",
    errUnavailable: "O assistente não está disponível agora. Você pode agendar uma demonstração.",
    errRateLimited: "Muitas consultas seguidas. Tente novamente em um minuto.",
    errInvalid: "Revise sua mensagem e tente novamente.",
    errMisconfigured: "O assistente ainda não está configurado neste ambiente.",
    errGeneric: "Não foi possível responder. Tente novamente.",
    roiTitle: "Estimativa com suas premissas",
    roiOps: "Operações por mês",
    roiHours: "Horas manuais por operação",
    roiCost: "Custo horário carregado",
    roiReduction: "Redução assumida (%)",
    roiSoftware: "Custo mensal da Logixtic (opcional)",
    roiCalculate: "Calcular",
    roiGross: "Economia bruta mensal",
    roiNet: "Economia líquida mensal",
    roiNote: "Estimativa ilustrativa com as premissas informadas. Não é promessa de resultados.",
    roiVersion: "Versão das premissas",
    intro: "Sou a Logix, sua assistente inteligente. Descubra como a Logixtic conecta sua operação comercial, logística e financeira. O que você gostaria de conhecer?",
  },
};

export function widgetLang(locale: Locale): WidgetLang {
  return locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";
}
