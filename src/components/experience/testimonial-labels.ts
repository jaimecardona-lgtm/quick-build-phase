/*
 * Etiquetas de interfaz del escenario de testimonio (no son copy comercial aprobado).
 * Viven fuera de los componentes del sitio para no alterar la verificación de copy.
 */
import type { Locale } from "@/lib/i18n";

export const TESTIMONIAL_LABELS: Record<"es" | "en" | "pt", { sound: string; muted: string }> = {
  es: { sound: "Ver testimonio con sonido", muted: "Reproducción silenciada" },
  en: { sound: "Watch testimonial with sound", muted: "Muted playback" },
  pt: { sound: "Assistir ao depoimento com som", muted: "Reprodução silenciosa" },
};

export function testimonialLang(locale: Locale): "es" | "en" | "pt" {
  return locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";
}
