/*
 * Manifiesto de medios cinematográficos locales. Verificado con ffprobe (ver docs/cinematic-media-inventory.md).
 * - src: derivado web 720p, H.264, yuv420p, sin audio, faststart. Ruta pública (/media/cinematic/...).
 * - poster: fotograma WebP visible hasta que el video esté listo.
 * - master: archivo fuente en public/media/cinematic (pendiente de mover fuera del bundle público).
 * - license: NO aprobada. Registrar autor, página de licencia y revisión de marcas antes de publicar.
 */

export type CinematicClip = {
  id: "sea" | "air" | "air_variant" | "rail" | "road" | "container_operations" | "scan" | "workers";
  src: string;
  poster: string;
  master: string;
  durationS: number;
  width: number;
  height: number;
  role: string;
  brandReview: "none-visible" | "minor-logos" | "prominent-brand";
  license: "pendiente";
};

export const CINEMATIC_CLIPS: Record<CinematicClip["id"], CinematicClip> = {
  sea: {
    id: "sea",
    src: "/media/cinematic/barco-720.mp4",
    poster: "/media/cinematic/barco-poster.webp",
    master: "public/media/cinematic/barco.mp4",
    durationS: 12,
    width: 1280,
    height: 720,
    role: "Hero: puerto con buque y grúas; ambiente marítimo",
    brandReview: "minor-logos",
    license: "pendiente",
  },
  air: {
    id: "air",
    src: "/media/cinematic/avion-720.mp4",
    poster: "/media/cinematic/avion-poster.webp",
    master: "public/media/cinematic/avion.mp4",
    durationS: 10,
    width: 1280,
    height: 720,
    role: "Hero (ventana aérea) y tracking: despegue de carguero",
    brandReview: "prominent-brand",
    license: "pendiente",
  },
  air_variant: {
    id: "air_variant",
    src: "/media/cinematic/avion1-720.mp4",
    poster: "/media/cinematic/avion1-poster.webp",
    master: "public/media/cinematic/avion1.mp4",
    durationS: 10,
    width: 1280,
    height: 720,
    role: "Variante aérea: carga en plataforma (no usada en UI hasta revisar marca)",
    brandReview: "prominent-brand",
    license: "pendiente",
  },
  rail: {
    id: "rail",
    src: "/media/cinematic/tren-720.mp4",
    poster: "/media/cinematic/tren-poster.webp",
    master: "public/media/cinematic/tren.mp4",
    durationS: 11.2,
    width: 1280,
    height: 720,
    role: "Tracking ferroviario: tren de contenedores",
    brandReview: "minor-logos",
    license: "pendiente",
  },
  road: {
    id: "road",
    src: "/media/cinematic/camion-720.mp4",
    poster: "/media/cinematic/camion-poster.webp",
    master: "public/media/cinematic/camion.mp4",
    durationS: 9.8,
    width: 406,
    height: 720,
    role: "Tracking terrestre: camiones en carretera (formato vertical 9:16)",
    brandReview: "none-visible",
    license: "pendiente",
  },
  container_operations: {
    id: "container_operations",
    src: "/media/cinematic/contendores-720.mp4",
    poster: "/media/cinematic/contendores-poster.webp",
    master: "public/media/cinematic/contendores.mp4",
    durationS: 12,
    width: 1280,
    height: 720,
    role: "Trasbordo de contenedores en terminal (grúas y pilas)",
    brandReview: "minor-logos",
    license: "pendiente",
  },
  scan: {
    id: "scan",
    src: "/media/cinematic/escaneo-720.mp4",
    poster: "/media/cinematic/escaneo-poster.webp",
    master: "public/media/cinematic/escaneo.mp4",
    durationS: 8.7,
    width: 1280,
    height: 720,
    role: "Registro de hito: persona escaneando código en bodega",
    brandReview: "none-visible",
    license: "pendiente",
  },
  workers: {
    id: "workers",
    src: "/media/cinematic/personal-720.mp4",
    poster: "/media/cinematic/personal-poster.webp",
    master: "public/media/cinematic/personal.mp4",
    durationS: 12,
    width: 1280,
    height: 720,
    role: "Personal de almacén moviendo carga (actores de stock, tarea genérica)",
    brandReview: "none-visible",
    license: "pendiente",
  },
};
