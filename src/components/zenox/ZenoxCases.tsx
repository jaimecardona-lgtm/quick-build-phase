import { useEffect, useState } from "react";
import { useToggleReveal } from "./use-toggle-reveal";
import "./zenox-cases.css";

/*
 * Casos de éxito tras el Hero (espejo de la sección "Clientes y casos de éxito" de Framer).
 * Contenido propio en español. Los testimonios son los autorizados en Framer.
 * Logos y fotografías de los clientes: restaurados por instrucción del propietario (Fase 4E).
 * Pendiente: documentar la autorización de distribución de cada logo y retrato antes de Render.
 * El video NO tiene autoplay: se abre al hacer clic y el usuario lo reproduce desde YouTube.
 */

const CASE_VIDEO_ID = "V39UQwu2THo";
const CASE_VIDEO_SRC = `https://www.youtube-nocookie.com/embed/${CASE_VIDEO_ID}?rel=0&playsinline=1`;

type CaseItem = {
  tab: string;
  logoName: string;
  logoId: string;
  logo: string;
  photo: string;
  person: string;
  meta: string;
  title: string;
  quote: string;
};

const CASES: readonly CaseItem[] = [
  {
    tab: "R&R Logistics CFS",
    logoName: "R&R Logistics CFS",
    logoId: "rr-logistics",
    logo: "/cases/logos/rr-logistics-cfs.png",
    photo: "/cases/diana-moncayo.png",
    person: "Diana Moncayo · Directora Comercial",
    meta: "R&R Logistics CFS / Miami",
    title: "Solución pensada para nuestra realidad",
    quote:
      "“Con Logixtic® logramos centralizar toda nuestra operación comercial, documental y logística en una sola plataforma, sin aumentar personal ni complejidad operativa.”",
  },
  {
    tab: "Connecta Global",
    logoName: "Connecta Global",
    logoId: "connecta-global",
    logo: "/cases/logos/connecta-global.png",
    photo: "/cases/carlos-sanchez.png",
    person: "Carlos Sánchez · Controller",
    meta: "Connecta Global / Panamá",
    title: "Adiós al caos de correos",
    quote:
      "“Con el portal de clientes de Logixtic® transformamos por completo la comunicación con nuestros clientes y la visibilidad de cada operación.”",
  },
  {
    tab: "Trade & Business SAS",
    logoName: "Trade & Business SAS",
    logoId: "trade-business",
    logo: "/cases/logos/trade-business-sas.png",
    photo: "/cases/dayana-ordonez.png",
    person: "Dayana Ordóñez · CEO",
    meta: "Trade & Business SAS / Colombia",
    title: "Centralización que transforma",
    quote:
      "“Antes de Logixtic®, nuestra operación era un caos de correos, llamadas y hojas de Excel. Hoy tenemos todo centralizado, los estatus se actualizan solos y el cliente siempre sabe en qué va su carga. Ahorramos tiempo y eliminamos errores que antes eran parte del día a día.”",
  },
];

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
