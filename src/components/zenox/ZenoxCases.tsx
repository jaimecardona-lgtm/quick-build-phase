import { useEffect, useRef, useState } from "react";
import { useToggleReveal } from "./use-toggle-reveal";
import "./zenox-cases.css";
import { CASES, CASE_VIDEO_ID, type CaseItem } from "@/lib/success-cases";

const CASE_VIDEO_SRC = `https://www.youtube-nocookie.com/embed/${CASE_VIDEO_ID}?rel=0&playsinline=1`;
// Tiempo que cada caso permanece visible antes de pasar al siguiente (1 → 2 → 3 → 1).
const CASE_INTERVAL_MS = 7000;

/*
 * Casos de éxito tras el Hero (espejo de la sección "Clientes y casos de éxito" de Framer).
 * Contenido propio en español. Los testimonios son los autorizados en Framer.
 * Logos y fotografías de los clientes: restaurados por instrucción del propietario (Fase 4E).
 * Pendiente: documentar la autorización de distribución de cada logo y retrato antes de Render.
 * El video NO tiene autoplay: se abre al hacer clic y el usuario lo reproduce desde YouTube.
 */

export function ZenoxCases() {
  const [active, setActive] = useState(0);
  // Se incrementa en cada selección manual para reiniciar el temporizador de 12 s.
  const [resetKey, setResetKey] = useState(0);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(true);
  const [docVisible, setDocVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  const [reduced, setReduced] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const caseRef = useToggleReveal<HTMLDivElement>();
  const [videoOpen, setVideoOpen] = useState(false);
  const current = CASES[active];

  // Movimiento reducido: sin avance automático; la selección manual sigue funcionando.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pausa cuando la sección sale del viewport y cuando la pestaña del navegador no es visible.
  useEffect(() => {
    const onVisibility = () => setDocVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const el = sectionRef.current;
    let observer: IntersectionObserver | undefined;
    if (el && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold: 0.25 });
      observer.observe(el);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  // El cursor encima NO pausa: solo el foco por teclado, el vídeo abierto, la sección fuera de pantalla,
  // la pestaña oculta o la preferencia de movimiento reducido.
  const paused = focused || videoOpen || !inView || !docVisible || reduced;

  // Avance automático. Cualquier cambio (manual o automático) reinicia el temporizador: sin saltos dobles.
  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % CASES.length), CASE_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, resetKey]);

  const selectCase = (index: number) => {
    setActive(index);
    setResetKey((k) => k + 1);
  };

  useEffect(() => {
    if (!videoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVideoOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoOpen]);

  if (!current) return null;

  return (
    <section
      ref={sectionRef}
      id="clientes-logos"
      className="zc"
      aria-labelledby="zc-title"
      onFocus={(e) => {
        // Solo la navegación por teclado pausa; un clic con el ratón no debe dejar el carrusel parado.
        if (e.target.matches(":focus-visible")) setFocused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="zc-bg" aria-hidden="true" />
      <div className="zx-wrap zc-inner">
        <header className="zc-head" data-reveal>
          <p className="zc-kicker">CLIENTES / HISTORIAS REALES</p>
          <h2 id="zc-title" className="zc-title">
            La logística, en la voz de quienes la viven.
          </h2>
        </header>

        <div className="zc-tabs" role="group" aria-label="Selecciona un caso de cliente" data-reveal>
          {CASES.map((c, i) => (
            <button
              key={c.logoId}
              type="button"
              className="zc-tab"
              aria-pressed={i === active}
              onClick={() => selectCase(i)}
            >
              {c.tab}
            </button>
          ))}
        </div>

        <div ref={caseRef} className="zc-case-wrap zx-tr" data-visible="true">
          <article key={current.logoId} className="zc-case zc-case-enter" data-case={current.logoId}>
            <figure className="zc-photo">
              <img src={current.photo} alt={`Fotografía de ${current.person.split(" · ")[0]}`} loading="lazy" decoding="async" />
            </figure>
            <div className="zc-copy">
              <p className="zc-meta">{current.meta}</p>
              <h3 className="zc-case-title">{current.title}</h3>
              <blockquote className="zc-quote">
                <p>{current.quote}</p>
              </blockquote>
              <p className="zc-person">{current.person}</p>
            </div>
          </article>
        </div>

        <ul className="zc-logos" aria-label="Logotipos de los clientes con caso publicado" data-reveal>
          {CASES.map((c) => (
            <li key={c.logoId}>
              <img data-logo={c.logoId} src={c.logo} alt={c.logoName} loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>

        <div className="zc-video" data-reveal>
          <div className="zc-video-intro">
            <p className="zc-kicker">EN PRIMERA PERSONA</p>
            <h3 className="zc-video-title">Escucha la experiencia completa.</h3>
          </div>
          <button type="button" className="zc-video-card" onClick={() => setVideoOpen(true)}>
            <span className="zc-kicker">LOGIXTIC / TESTIMONIO</span>
            <span className="zc-video-cta">Ver video testimonial</span>
          </button>
        </div>
      </div>

      {videoOpen ? (
        <div className="zc-overlay" role="dialog" aria-modal="true" aria-label="Video testimonial" onClick={() => setVideoOpen(false)}>
          <div className="zc-overlay-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="zc-close" onClick={() => setVideoOpen(false)} autoFocus>
              Cerrar video
            </button>
            <div className="zc-frame">
              <iframe src={CASE_VIDEO_SRC} title="Video testimonial de cliente Logixtic" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
