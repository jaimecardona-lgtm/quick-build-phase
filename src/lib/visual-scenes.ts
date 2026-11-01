/*
 * Manifiesto de escenas visuales de la variante Motion Forwarders V2 (solo activa con --mode forwarders-v2).
 *
 * REGLA: un mismo masterId no puede aparecer en más de una sección (scripts/verify-video-exclusivity.mjs).
 * Un derivado (-720.mp4, -poster.webp) cuenta como el mismo masterId que su original.
 * Las secciones sin video exclusivo usan imagen (SceneStill) o composición CSS/SVG (DataNetworkLayer).
 *
 * Derechos: ninguno de estos recursos tiene permiso comercial verificado todavía (ver license-manifest.json).
 * avion1.mp4 muestra la marca Delta; personal.mp4 y escaneo.mp4 muestran personas (uso autorizado por el
 * responsable para estas secciones; ver docs/motion-forwarders-v2/DECISIONES.md).
 */
import { CINEMATIC_CLIPS, type CinematicClip } from "@/lib/cinematic-media";

export type SectionId =
  | "hero"
  | "tracking"
  | "clients"
  | "operational-challenges"
  | "problem"
  | "success"
  | "flow"
  | "logix"
  | "why-choose"
  | "evidence"
  | "implementation"
  | "plans"
  | "faq"
  | "closing";

// Identificadores de sección del manifiesto (constantes, no literales en los componentes).
export const SCENE_SECTIONS = {
  hero: "hero",
  tracking: "tracking",
  clients: "clients",
  operationalChallenges: "operational-challenges",
  problem: "problem",
  success: "success",
  flow: "flow",
  logix: "logix",
  whyChoose: "why-choose",
  evidence: "evidence",
  implementation: "implementation",
  plans: "plans",
  faq: "faq",
  closing: "closing",
} as const satisfies Record<string, SectionId>;

export type VideoScene = {
  kind: "video";
  masterId: string;
  sectionId: SectionId;
  clip: CinematicClip;
  purpose: string;
  representation: "footage";
};

export type ImageScene = {
  kind: "image";
  masterId: string;
  sectionId: SectionId;
  src: string;
  alt: string;
  purpose: string;
  representation: "photo" | "conceptual-demo";
};

export type VisualScene = VideoScene | ImageScene;

export const VISUAL_SCENES: readonly VisualScene[] = [
  {
    kind: "video",
    masterId: "tren",
    sectionId: "tracking",
    clip: CINEMATIC_CLIPS.rail,
    purpose: "Continuidad multimodal ferroviaria como contexto de coordinación",
    representation: "footage",
  },
  {
    kind: "video",
    masterId: "contendores",
    sectionId: "flow",
    clip: CINEMATIC_CLIPS.container_operations,
    purpose: "Operación física (terminal de contenedores) que pasa a registro digital en Flow",
    representation: "footage",
  },
  {
    kind: "video",
    masterId: "avion1",
    sectionId: "evidence",
    clip: CINEMATIC_CLIPS.air_variant,
    purpose: "Presencia regional y cobertura internacional detrás del mapa; no es hero ni servicio de transporte",
    representation: "footage",
  },
  {
    kind: "video",
    masterId: "personal",
    sectionId: "implementation",
    clip: CINEMATIC_CLIPS.workers,
    purpose: "Implementación y acompañamiento: cercanía humana en la puesta en marcha",
    representation: "footage",
  },
  {
    kind: "video",
    masterId: "escaneo",
    sectionId: "why-choose",
    clip: CINEMATIC_CLIPS.scan,
    purpose: "Control documental y digitalización: registro de hitos en la operación conectada",
    representation: "footage",
  },
  {
    kind: "image",
    masterId: "img-contenedores",
    sectionId: "problem",
    src: "/media/img/contenedores.jpg",
    alt: "",
    purpose: "Complejidad y dispersión de la operación física antes de centralizar la información",
    representation: "photo",
  },
  {
    kind: "image",
    masterId: "img-digitalizacion",
    sectionId: "hero",
    src: "/media/img/digitalizacion.jpg",
    alt: "",
    purpose: "Hero V2: sistema operativo digital; imagen estática con capa conceptual rotulada DEMO (no es captura del producto)",
    representation: "conceptual-demo",
  },
];

/** Clips de video asignados a una sección (vacío si no tiene video exclusivo). */
export function videoClipsFor(sectionId: SectionId): CinematicClip[] {
  return VISUAL_SCENES.flatMap((s) => (s.kind === "video" && s.sectionId === sectionId ? [s.clip] : []));
}

/** Imagen asignada a una sección, si la tiene. */
export function imageSceneFor(sectionId: SectionId): ImageScene | undefined {
  return VISUAL_SCENES.find((s): s is ImageScene => s.kind === "image" && s.sectionId === sectionId);
}
