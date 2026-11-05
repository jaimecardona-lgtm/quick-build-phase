import { useEffect, useRef } from "react";
import type { CinematicClip } from "@/lib/cinematic-media";
import { useLanguage } from "@/lib/i18n";
import { CINEMATIC_ENABLED } from "@/lib/cinematic-assets";
import "@/components/experience/scene-backgrounds.css";

// Videos sin licencia aprobada: apagados salvo VITE_LOGIXTIC_CINEMATIC_VIDEO_APPROVED=true.
const CINEMATIC_VIDEO_APPROVED = import.meta.env["VITE_LOGIXTIC_CINEMATIC_VIDEO_APPROVED"] === "true";

/*
 * Fondo audiovisual secuencial para una sección. Reproduce sus clips en orden, uno a la vez, con
 * crossfade; al terminar la lista reinicia. Silenciado, en bucle de lista, pausado fuera de pantalla.
 * Poster siempre visible como respaldo; con movimiento reducido se queda en el poster.
 * SSR-seguro: el DOM solo se toca en efectos. Sin React state por frame (todo por atributos).
 */

type Props = {
  clips: CinematicClip[];
  className?: string;
  // Aviso visible de imagen de apoyo con actores de stock (texto localizado dentro del componente).
  stockNotice?: boolean;
  // Solo el primer clip de la sección se precarga con prioridad.
  priority?: boolean;
};

const FADE_LEAD_S = 1.4; // segundos antes del final en los que empieza el crossfade al siguiente
const FADE_OUT_MS = 1600;

const STOCK: Record<"es" | "en" | "pt", string> = {
  es: "Imagen de apoyo · personas en bodega (actores de stock, tarea genérica)",
  en: "Supporting footage · warehouse workers (stock actors, generic task)",
  pt: "Imagem de apoio · pessoas em armazém (atores de stock, tarefa genérica)",
};

export function CinematicBackgroundSequence({
  clips,
  className,
  stockNotice = false,
  priority = false,
}: Props) {
  const { locale } = useLanguage();
  const lang = locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const videos = videoRefs.current.filter((v): v is HTMLVideoElement => !!v);
    if (videos.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      videos.forEach((v) => v.pause());
      return;
    }

    let active = 0;
    let visible = false;
    const timers: number[] = [];
    let switching = false;

    // Reanuda el clip activo sin reiniciarlo; solo un cambio de clip empieza desde 0.
    const playAt = (index: number, restart = false) => {
      const next = videos[index];
      if (!next) return;
      if (restart) next.currentTime = 0;
      next.dataset["active"] = "true";
      void next.play().catch(() => undefined);
    };

    const switchTo = (index: number) => {
      if (switching || index === active) return;
      switching = true;
      const prev = videos[active];
      active = index;
      playAt(index, true);
      // Prebuffer del siguiente clip.
      const after = videos[(index + 1) % videos.length];
      if (after) after.preload = "auto";
      if (prev) {
        prev.dataset["active"] = "false";
        timers.push(window.setTimeout(() => prev.pause(), FADE_OUT_MS));
      }
      timers.push(window.setTimeout(() => (switching = false), FADE_OUT_MS / 2));
    };

    const onTime = (video: HTMLVideoElement, index: number) => () => {
      if (index !== active || !visible || videos.length < 2) return;
      if (video.duration && video.duration - video.currentTime <= FADE_LEAD_S) {
        switchTo((index + 1) % videos.length);
      }
    };

    const onReady = (video: HTMLVideoElement) => () => {
      video.dataset["ready"] = "true";
    };

    const onError = (video: HTMLVideoElement, index: number) => () => {
      video.dataset["failed"] = "true";
      if (index === active && videos.length > 1) switchTo((index + 1) % videos.length);
    };

    const cleanups: (() => void)[] = [];
    videos.forEach((video, i) => {
      const t = onTime(video, i);
      const r = onReady(video);
      const e = onError(video, i);
      video.addEventListener("timeupdate", t);
      video.addEventListener("loadeddata", r);
      video.addEventListener("error", e);
      cleanups.push(() => {
        video.removeEventListener("timeupdate", t);
        video.removeEventListener("loadeddata", r);
        video.removeEventListener("error", e);
      });
    });

    // loadeddata puede dispararse antes de registrar el listener (el vídeo carga durante la hidratación).
    videos.forEach((v) => {
      if (v.readyState >= 2) v.dataset["ready"] = "true";
    });

    // Solo reproduce mientras la sección está en pantalla.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        if (visible) {
          playAt(active);
        } else {
          videos.forEach((v) => v.pause());
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(root);

    const onVisibility = () => {
      if (document.hidden) videos.forEach((v) => v.pause());
      else if (visible) playAt(active);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Primer clip: marcado como activo desde el inicio para que el primer fotograma aparezca sin salto.
    videos[0]!.dataset["active"] = "true";

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      cleanups.forEach((fn) => fn());
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [clips]);

  // Sin el flag cinematográfico no se renderiza nada: la producción conserva su apariencia actual.
  // Los clips son videos sin licencia documentada (ver license-manifest.json): solo se reproducen si se aprueban explícitamente.
  if (!CINEMATIC_ENABLED || !CINEMATIC_VIDEO_APPROVED) return null;

  const poster = clips[0]?.poster ?? "";

  return (
    <div ref={rootRef} className={`bgseq ${className ?? ""}`} aria-hidden="true">
      <img
        className="bgseq-poster"
        src={poster}
        alt=""
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
      {clips.map((clip, i) => (
        <video
          key={clip.id}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          className="bgseq-video"
          src={clip.src}
          poster={clip.poster}
          muted
          loop={clips.length === 1}
          playsInline
          preload={i === 0 && priority ? "auto" : "metadata"}
          tabIndex={-1}
          aria-hidden="true"
        />
      ))}
      <div className="bgseq-scrim" />
      {stockNotice ? <span className="bgseq-notice font-ui">{STOCK[lang]}</span> : null}
    </div>
  );
}
