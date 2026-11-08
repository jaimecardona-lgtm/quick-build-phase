import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/lib/i18n";
import { successCopy } from "@/lib/whatsapp";
import { TestimonialStage } from "@/components/experience/TestimonialStage";
import { CinematicBackgroundSequence } from "@/components/experience/CinematicBackgroundSequence";
import { CINEMATIC_CLIPS } from "@/lib/cinematic-media";
import { FORWARDERS_V2 } from "@/lib/cinematic-assets";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";
import { CASES, CASE_VIDEO_ID, type CaseItem } from "@/lib/success-cases";
import { useToggleReveal } from "@/components/zenox/use-toggle-reveal";
import "./success-stories-zenox.css";

// Tren en tránsito de fondo: continuidad de la operación detrás del reproductor.
const SUCCESS_CLIPS = [CINEMATIC_CLIPS.rail];

// Video autorizado existente (no se re-aloja ni se descarga).
const VIDEO_ID = CASE_VIDEO_ID;
const POSTER = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`;

/*
 * variant "legacy" (por defecto): sin cambios; control de regresión de legacy-home y zenox-preview.
 * variant "zenox": fondo cinematográfico del kit, tres casos compactos (mismos datos que "La logística, en la voz…")
 * y tarjeta del video que abre el reproductor original de YouTube solo tras un clic (sin autoplay al cargar).
 */
export function SuccessStories({ variant = "legacy" }: { variant?: "legacy" | "zenox" } = {}) {
  const { locale } = useLanguage();
  const t = successCopy[locale];
  if (variant === "zenox") return <SuccessStoriesZenox title={t} />;

  return (
    <section id="transformacion" aria-labelledby="casos-title" className="success-shell amb bgseq-host">
      {FORWARDERS_V2 ? <div className="scene-photo scene-photo-cargo" aria-hidden="true" /> : null}
      {FORWARDERS_V2 ? (
        <DataNetworkLayer variant="network" />
      ) : (
        <CinematicBackgroundSequence clips={SUCCESS_CLIPS} className="bgseq-veil-strong" />
      )}
      <div className="mx-auto max-w-[1150px] px-5 text-center md:px-8">
        <div data-reveal className="reveal-item">
          <p className="section-kicker">{t.kicker}</p>
          <h2 id="casos-title" className="section-title-dark mx-auto mt-4 text-balance">
            {t.titleStart}{" "}
            <span className="success-brand">
              Logi<span>x</span>tic
            </span>
          </h2>
          <p className="success-body">{t.body}</p>
        </div>
        <div data-reveal className="reveal-item success-video-wrap">
          <TestimonialStage
            videoId={VIDEO_ID}
            poster={POSTER}
            posterAlt={t.coverAlt}
            title={t.play}
            aria-label="Ver historia de cliente"
          />
        </div>
      </div>
    </section>
  );
}

type SuccessTitle = (typeof successCopy)[keyof typeof successCopy];

function splitPerson(person: string): [string, string] {
  const [name = "", role = ""] = person.split(" · ");
  return [name, role];
}

function SuccessStoriesZenox({ title }: { title: SuccessTitle }) {
  const sectionRef = useToggleReveal<HTMLElement>();
  const [videoOpen, setVideoOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Parallax suave del fondo (variable CSS, solo transform). Con movimiento reducido no se aplica.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      el.style.setProperty("--ss-p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionRef]);

  const closeVideo = () => {
    setVideoOpen(false);
    // Devuelve el foco al disparador tras cerrar el modal.
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <section
      ref={sectionRef}
      id="transformacion"
      aria-labelledby="casos-title"
      className="success-shell zx-ss"
      data-visible="true"
    >
      <div className="zx-ss-bg" aria-hidden="true">
        <div className="zx-ss-par">
          <div className="zx-ss-img" />
        </div>
      </div>
      <div className="mx-auto max-w-[1150px] px-5 md:px-8 zx-ss-inner">
        <div className="zx-ss-head">
          <p className="section-kicker">{title.kicker}</p>
          <h2 id="casos-title" className="section-title-dark mt-4 text-balance">
            {title.titleStart}{" "}
            <span className="success-brand">
              Logi<span>x</span>tic
            </span>
          </h2>
          <p className="success-body">{title.body}</p>
        </div>

        <div className="zx-ss-grid">
          <ul className="zx-ss-cases" aria-label="Casos de clientes">
            {CASES.map((c, i) => (
              <li key={c.logoId}>
                <SuccessCase item={c} index={i} />
              </li>
            ))}
          </ul>

          <div className="zx-ss-video" style={{ "--i": 3 } as CSSProperties}>
            <button ref={triggerRef} type="button" className="zx-ss-play" onClick={() => setVideoOpen(true)} aria-haspopup="dialog">
              <img className="zx-ss-poster" src={POSTER} alt="" loading="lazy" decoding="async" />
              <span className="zx-ss-shade" aria-hidden="true" />
              <span className="zx-ss-kicker">EN PRIMERA PERSONA</span>
              <span className="zx-ss-cta">
                <span className="zx-ss-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
                  </svg>
                </span>
                <span className="zx-ss-cta-text">
                  <strong>Conoce la experiencia completa</strong>
                  <small>Video testimonial · se reproduce al hacer clic</small>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
      {videoOpen ? createPortal(<CaseVideoModal onClose={closeVideo} />, document.body) : null}
    </section>
  );
}

function SuccessCase({ item, index }: { item: CaseItem; index: number }) {
  const [name, role] = splitPerson(item.person);
  return (
    <article className="zx-ss-card" tabIndex={0} style={{ "--i": index } as CSSProperties}>
      <div className="zx-ss-who">
        <img className="zx-ss-photo" src={item.photo} alt={`Fotografía de ${name}`} loading="lazy" decoding="async" />
        <div className="zx-ss-name">
          <p className="zx-ss-person">{name}</p>
          <p className="zx-ss-role">{role}</p>
        </div>
      </div>
      <div className="zx-ss-company">
        <img className="zx-ss-logo" src={item.logo} alt={item.logoName} loading="lazy" decoding="async" data-logo={item.logoId} />
        <span className="zx-ss-meta">{item.meta}</span>
      </div>
      <p className="zx-ss-result">
        <span className="zx-ss-result-label">Resultado</span>
        {item.result}
      </p>
      <blockquote className="zx-ss-quote">
        <p>“{item.excerpt}”</p>
      </blockquote>
    </article>
  );
}

function CaseVideoModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    // Escape se escucha en el documento: con el foco dentro del iframe de YouTube el evento no llega al diálogo.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      } else if (e.key === "Tab") {
        // El único elemento enfocable del diálogo es el cierre (el iframe va fuera del orden de Tab): Tab no sale del modal.
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    // Foco atrapado: si sale del diálogo, vuelve al botón de cierre. El iframe queda fuera del orden de Tab
    // (tabIndex -1) porque, dentro de él, Escape no llega al documento.
    const onFocusIn = (e: FocusEvent) => {
      const dialog = dialogRef.current;
      if (dialog && e.target instanceof Node && !dialog.contains(e.target)) closeRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return (
    <div className="zx-ss-modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className="zx-ss-dialog" role="dialog" aria-modal="true" aria-label="Video testimonial de Logixtic">
        <button ref={closeRef} type="button" className="zx-ss-close" onClick={onClose} aria-label="Cerrar video">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </button>
        <div className="zx-ss-frame">
          <iframe
            tabIndex={-1}
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&playsinline=1`}
            title="Video testimonial de cliente Logixtic"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
