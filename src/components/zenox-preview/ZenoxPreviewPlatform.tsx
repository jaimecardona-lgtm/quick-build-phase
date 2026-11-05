import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileSpreadsheet, FileText, Mail, MessageCircle, Receipt } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";
import {
  PREVIEW_COPY,
  PREVIEW_CONCEPT,
  previewLang,
} from "@/components/zenox-preview/zenox-preview-copy";

// Tres estados con composiciones distintas:
// 1) Dispersión: ilustración conceptual (no es captura). 2) Conexión: captura real + nodos conectados.
// 3) Control: dos capturas reales de seguimiento y rentabilidad. Textos desde PREVIEW_COPY.
const KEYS = ["dispersa", "conexion", "control"] as const;

// Posiciones fijas (porcentaje) de la ilustración conceptual: desordenadas a propósito, sin conexiones.
const SCATTER = [
  { x: 4, y: 6, r: -4, Icon: FileSpreadsheet },
  { x: 52, y: 2, r: 3, Icon: Mail },
  { x: 24, y: 46, r: 2, Icon: Receipt },
  { x: 60, y: 52, r: -3, Icon: FileText },
  { x: 8, y: 74, r: 5, Icon: MessageCircle },
] as const;

// Nodos del estado 2 alrededor de la captura, y su trayectoria hacia el centro (en %).
const NODE_POS = [
  { x: 6, y: 14, ex: 8, ey: 30 },
  { x: 94, y: 14, ex: 92, ey: 30 },
  { x: 6, y: 84, ex: 8, ey: 70 },
  { x: 94, y: 84, ex: 92, ey: 70 },
] as const;

// Captura real ampliable: el botón conserva la posición del stage; el visor muestra la misma imagen completa.
function ZoomableCapture({
  src,
  alt,
  className,
  zoomLabel,
  closeLabel,
  demoLabel,
}: {
  src: string;
  alt: string;
  className: string;
  zoomLabel: string;
  closeLabel: string;
  demoLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Escape cierra; el foco entra en "Cerrar" al abrir y vuelve al botón de apertura al cerrar.
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) triggerRef.current?.focus();
    return undefined;
  }, [open]);

  useEffect(() => {
    wasOpen.current = open;
  }, [open]);

  // Bloqueo del scroll de fondo mientras el visor está abierto.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`zxp-zoom-trigger ${className}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${alt}. ${zoomLabel}`}
      >
        <img src={src} alt="" loading="lazy" decoding="async" />
      </button>
      {open
        ? createPortal(
            <div
              className="zxp-zoom"
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              onClick={() => setOpen(false)}
            >
              <button
                ref={closeRef}
                type="button"
                className="zxp-zoom-close"
                onClick={() => setOpen(false)}
              >
                {closeLabel}
              </button>
              <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
              <p className="zxp-zoom-note">{demoLabel}</p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function ZenoxPreviewPlatform() {
  const { locale } = useLanguage();
  const lang = previewLang(locale);
  const t = PREVIEW_COPY[lang].platform;
  const concept = PREVIEW_CONCEPT[lang];
  const [active, setActive] = useState(0);
  const current = t.states[active] ?? t.states[0];
  const zoomLabel = lang === "en" ? "Enlarge" : "Ampliar";
  const demoLabel =
    lang === "en"
      ? "Demo data · not real operations"
      : lang === "pt"
        ? "Dados demonstrativos · não são operações reais"
        : "Datos demostrativos · no son operaciones reales";
  const closeLabel = lang === "en" ? "Close" : lang === "pt" ? "Fechar" : "Cerrar";
  const currentKey = KEYS[active] ?? KEYS[0];

  return (
    <section id="fragmentacion" className="zxp-platform" aria-labelledby="zxp-platform-title">
      <DataNetworkLayer variant="dispersion" />
      <div className="zxp-section-head">
        <p className="zxp-kicker">{t.kicker}</p>
        <h2 id="zxp-platform-title" className="zxp-h2">
          {t.h2}
        </h2>
      </div>

      <div className="zxp-platform-grid">
        <div role="tablist" aria-label={t.tabsLabel} className="zxp-platform-tabs">
          {t.states.map((s, i) => (
            <button
              key={KEYS[i]}
              id={`zxp-tab-${KEYS[i]}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls="zxp-platform-panel"
              tabIndex={i === active ? 0 : -1}
              className={`zxp-tab${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowRight")
                  setActive((i + 1) % t.states.length);
                if (e.key === "ArrowUp" || e.key === "ArrowLeft")
                  setActive((i - 1 + t.states.length) % t.states.length);
              }}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div
          id="zxp-platform-panel"
          role="tabpanel"
          aria-labelledby={`zxp-tab-${currentKey}`}
          className="zxp-platform-panel"
          key={currentKey}
        >
          <h3 className="zxp-h3">{current.title}</h3>
          <p className="zxp-body">{current.body}</p>

          {active === 0 ? (
            <figure className="zxp-stage zxp-stage-scatter" aria-label={concept.label}>
              {SCATTER.map(({ x, y, r, Icon }, i) => (
                <span
                  key={i}
                  className="zxp-scatter-card"
                  style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${r}deg)` }}
                >
                  <Icon aria-hidden="true" size={16} />
                  <span>{concept.scatter[i]}</span>
                </span>
              ))}
              <svg
                className="zxp-scatter-lines"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M10 14 L62 10" />
                <path d="M30 52 L70 58" />
                <path d="M14 80 L34 52" />
              </svg>
              <figcaption className="zxp-stage-caption">{concept.label}</figcaption>
            </figure>
          ) : null}

          {active === 1 ? (
            <figure className="zxp-stage zxp-stage-connect">
              <ZoomableCapture
                src="/assets/04-seguimiento-operativo-pasos.webp"
                alt={current.alt}
                className="zxp-stage-main"
                zoomLabel={zoomLabel}
                closeLabel={closeLabel}
                demoLabel={demoLabel}
              />
              <svg
                className="zxp-connect-lines"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {NODE_POS.map((p, i) => (
                  <path
                    key={i}
                    className="zxp-connect-path"
                    style={{ animationDelay: `${i * 0.5}s` }}
                    d={`M${p.x} ${p.y} Q${(p.x + p.ex) / 2} ${(p.y + p.ey) / 2} ${p.ex} ${p.ey}`}
                  />
                ))}
              </svg>
              {NODE_POS.map((p, i) => (
                <span
                  key={i}
                  className="zxp-connect-node"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  {concept.nodes[i]}
                </span>
              ))}
              <span className="zxp-connect-hub">{concept.hub}</span>
            </figure>
          ) : null}

          {active === 2 ? (
            <figure className="zxp-stage zxp-stage-control">
              <ZoomableCapture
                src="/assets/07-rentabilidad-margen.webp"
                alt={current.alt}
                className="zxp-stage-main"
                zoomLabel={zoomLabel}
                closeLabel={closeLabel}
                demoLabel={demoLabel}
              />
              <img
                className="zxp-stage-inset"
                src="/assets/05-seguimiento-operativo-tareas.webp"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span className="zxp-control-chip zxp-control-chip-a">
                {lang === "en"
                  ? "Traceability by stage"
                  : lang === "pt"
                    ? "Rastreabilidade por etapa"
                    : "Trazabilidad por etapa"}
              </span>
              <span className="zxp-control-chip zxp-control-chip-b">
                {lang === "en"
                  ? "Margin per operation"
                  : lang === "pt"
                    ? "Margem por operação"
                    : "Margen por operación"}
              </span>
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}
