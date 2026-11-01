/*
 * Copy CANDIDATO de la sección "Por qué elegirnos" (variante V2). No es copy aprobado: requiere aprobación
 * editorial en ES/EN/PT-BR y verificación de cada capacidad en el producto antes de publicarse.
 */
import type { Locale } from "@/lib/i18n";
import { traceLang } from "@/components/experience/trace-labels";

export const WHY_CHOOSE_CANDIDATE: Record<"es" | "en" | "pt", { kicker: string; items: readonly string[] }> = {
  es: {
    kicker: "Por qué elegirnos",
    items: [
      "Gestión integral de operaciones",
      "Cotizaciones y costos",
      "Control documental",
      "Control de profit en tiempo real",
      "Reportes e inteligencia",
    ],
  },
  en: {
    kicker: "Why choose us",
    items: [
      "Integrated operations management",
      "Quotes and costs",
      "Document control",
      "Real-time profit control",
      "Reports and intelligence",
    ],
  },
  pt: {
    kicker: "Por que nos escolher",
    items: [
      "Gestão integral de operações",
      "Cotações e custos",
      "Controle documental",
      "Controle de lucro em tempo real",
      "Relatórios e inteligência",
    ],
  },
};

export function whyChooseCopy(locale: Locale) {
  return WHY_CHOOSE_CANDIDATE[traceLang(locale)];
}
