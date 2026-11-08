import { useEffect, useState } from "react";
import { useToggleReveal } from "./use-toggle-reveal";
import "./zenox-cases.css";
import { CASES, CASE_VIDEO_ID, type CaseItem } from "@/lib/success-cases";

const CASE_VIDEO_SRC = `https://www.youtube-nocookie.com/embed/${CASE_VIDEO_ID}?rel=0&playsinline=1`;

/*
 * Casos de éxito tras el Hero (espejo de la sección "Clientes y casos de éxito" de Framer).
 * Contenido propio en español. Los testimonios son los autorizados en Framer.
 * Logos y fotografías de los clientes: restaurados por instrucción del propietario (Fase 4E).
 * Pendiente: documentar la autorización de distribución de cada logo y retrato antes de Render.
 * El video NO tiene autoplay: se abre al hacer clic y el usuario lo reproduce desde YouTube.
 */

export function ZenoxCases() {
  const [active, setActive] = useState(0);
  const caseRef = useToggleReveal<HTMLDivElement>();
  const [videoOpen, setVideoOpen] = useState(false);
  const current = CASES[active];

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
    <section id="clientes-logos" className="zc" aria-labelledby="zc-title">
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
              onClick={() => setActive(i)}
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
