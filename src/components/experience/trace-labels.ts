/*
 * Etiqueta ilustrativa del trazo de datos de Flow. Es interfaz DEMO, no copy comercial aprobado.
 */
import type { Locale } from "@/lib/i18n";

export const TRACE_LABEL: Record<"es" | "en" | "pt", string> = {
  es: "Ilustrativo · DEMO",
  en: "Illustrative · DEMO",
  pt: "Ilustrativo · DEMO",
};

export function traceLang(locale: Locale): "es" | "en" | "pt" {
  return locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";
}
