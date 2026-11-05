import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { PREVIEW_COPY, previewLang } from "@/components/zenox-preview/zenox-preview-copy";

// Capturas reales de Logixtic (datos demostrativos). Rutas de imagen fijas; textos desde PREVIEW_COPY.
const IMAGES = [
  "/assets/02-gestion-comercial-resumen.webp",
  "/assets/04-seguimiento-operativo-pasos.webp",
  "/assets/06-costos-operacion.webp",
] as const;
const KEYS = ["dispersa", "conexion", "control"] as const;

export function ZenoxPreviewPlatform() {
  const { locale } = useLanguage();
  const t = PREVIEW_COPY[previewLang(locale)].platform;
  const [active, setActive] = useState(0);
  const current = t.states[active] ?? t.states[0];
  const currentKey = KEYS[active] ?? KEYS[0];

  return (
    <section id="fragmentacion" className="zxp-platform" aria-labelledby="zxp-platform-title">
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
          <figure className="zxp-shot">
            <img
              src={IMAGES[active] ?? IMAGES[0]}
              alt={current.alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
