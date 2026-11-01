import type { ImageScene } from "@/lib/visual-scenes";
import { TRACE_LABEL, traceLang } from "@/components/experience/trace-labels";
import { useLanguage } from "@/lib/i18n";
import "@/components/experience/scene-stills.css";

/*
 * Fondo de sección con imagen de la variante V2. Usa la clase .bgseq para quedar como fondo absoluto
 * (no toma el z-index de contenido). Si la imagen es conceptual, lleva la etiqueta DEMO visible.
 */
type Props = {
  scene: ImageScene;
  className?: string;
  // Imagen por encima del pliegue (hero): carga inmediata.
  eager?: boolean;
};

export function SceneStill({ scene, className, eager = false }: Props) {
  const { locale } = useLanguage();
  const demo = scene.representation === "conceptual-demo";
  return (
    <div className={`bgseq scene-still ${className ?? ""}`}>
      <img src={scene.src} alt={scene.alt} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />
      <div className="scene-still-veil" aria-hidden="true" />
      {demo ? <span className="scene-still-demo font-ui">{TRACE_LABEL[traceLang(locale)]}</span> : null}
    </div>
  );
}
