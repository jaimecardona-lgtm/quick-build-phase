/*
 * Medios del hero cinematográfico. Solo imágenes existentes del proyecto.
 * Los videos aprobados aún no existen: ver docs/cinematic-asset-audit.md y public/media/cinematic/license-manifest.json.
 */
import portPlate from "@/assets/logixtic-port-hero.webp.asset.json";
import globePlate from "@/assets/closing-globe.webp.asset.json";

// Activa el sistema visual cinematográfico (hero, trazabilidad, cobertura global, luces). Ver .env.development.
export const CINEMATIC_ENABLED = import.meta.env["VITE_LOGIXTIC_MOTION_V2"] === "true";

export const CINEMATIC_PLATES = {
  // Capítulo A: fotografía de puerto nocturno (provisional, procedencia pendiente).
  port: { src: portPlate.url, width: 1672, height: 941 },
  // Capítulo B: globo de red (resolución baja: solo en un marco pequeño).
  globe: { src: globePlate.url, width: 680, height: 388 },
} as const;

// Capítulo D/E: capturas reales de Logixtic (aprobadas por el sitio).
export const PRODUCT_SCREENS = {
  overview: "/assets/01-plataforma-servicios-menu.webp",
} as const;
