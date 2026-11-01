import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { TESTIMONIAL_LABELS, testimonialLang } from "@/components/experience/testimonial-labels";
import "@/components/experience/testimonial-stage.css";

/*
 * Escenario inline del testimonio de YouTube (video autorizado existente, ID sin cambios).
 * - El iframe carga al acercarse la sección (no antes).
 * - Reproduce SILENCIADO solo cuando más del 50 % del reproductor está visible; pausa por debajo del 25 %.
 * - El sonido se activa únicamente con un gesto del usuario en el botón de fuera del iframe.
 * - Pausa al ocultar la pestaña y no se reproduce con movimiento reducido.
 * Control por postMessage del reproductor con enablejsapi=1 (protocolo de la API IFrame).
 * El autoplay no está garantizado por el navegador: el botón de sonido siempre está disponible.
 */

type Props = {
  videoId: string;
  poster: string;
  posterAlt: string;
  title: string;
  "aria-label": string;
};

const YT_ORIGIN = "https://www.youtube-nocookie.com";

function command(frame: HTMLIFrameElement | null, func: string) {
  frame?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    YT_ORIGIN,
  );
}

export function TestimonialStage({
  videoId,
  poster,
  posterAlt,
  title,
  "aria-label": ariaLabel,
}: Props) {
  const { locale } = useLanguage();
  const labels = TESTIMONIAL_LABELS[testimonialLang(locale)];
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const ratioRef = useRef(0);
  const getFrame = () => frameRef.current;
  const soundRef = useRef(false);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [origin, setOrigin] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Solo en cliente: origen para la API y preferencia de movimiento.
  useEffect(() => {
    setOrigin(window.location.origin);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Carga diferida: el iframe se crea al acercarse la sección.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Reproducción según visibilidad del reproductor completo (umbrales 0, .25, .5, .65, 1).
  useEffect(() => {
    const el = stageRef.current;
    if (!el || reduced) return;
    const apply = () => {
      const frame = frameRef.current;
      if (!frame || !loaded) return;
      const ratio = ratioRef.current;
      if (ratio > 0.5 && !document.hidden) {
        if (!soundRef.current) command(frame, "mute");
        command(frame, "playVideo");
      } else if (ratio < 0.25) {
        command(frame, "pauseVideo");
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        ratioRef.current = entry?.intersectionRatio ?? 0;
        apply();
      },
      { threshold: [0, 0.25, 0.5, 0.65, 1] },
    );
    io.observe(el);
    const onVisibility = () => {
      const frame = frameRef.current;
      if (document.hidden) command(frame, "pauseVideo");
      else apply();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      command(getFrame(), "pauseVideo");
    };
  }, [loaded, reduced]);

  const enableSound = () => {
    soundRef.current = true;
    setSoundOn(true);
    const frame = frameRef.current;
    command(frame, "unMute");
    command(frame, "playVideo");
  };

  const src = near
    ? `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&mute=1&playsinline=1&rel=0&modestbranding=0${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`
    : undefined;

  return (
    <div
      ref={stageRef}
      className="ts-stage"
      role="group"
      aria-label={ariaLabel}
      data-sound={soundOn ? "on" : "off"}
    >
      <div className="ts-frame">
        <img
          className="ts-poster"
          src={poster}
          alt={posterAlt}
          data-hidden={loaded}
          loading="lazy"
          decoding="async"
        />
        {src ? (
          <iframe
            ref={frameRef}
            className="ts-iframe"
            src={src}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        ) : null}
      </div>
      <div className="ts-controls">
        <button
          type="button"
          className="ts-sound focus-ring"
          onClick={enableSound}
          aria-pressed={soundOn}
          disabled={soundOn}
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          <span>{labels.sound}</span>
        </button>
        {soundOn ? null : <span className="ts-status font-ui">{labels.muted}</span>}
      </div>
    </div>
  );
}
