import { useState } from "react";
import {
  Activity,
  FileText,
  Gauge,
  Link2,
  Network,
  Receipt,
  Route,
  TrendingUp,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";
import { PREVIEW_COPY, previewLang } from "@/components/zenox-preview/zenox-preview-copy";

// Ocho capacidades en tres grupos (textos aprobados). Presentación: raíl de grupos conectado y línea de tiempo.
const GROUP_KEYS = ["comercial", "operativa", "rentabilidad"] as const;
const GROUP_ICONS = [TrendingUp, Workflow, Gauge] as const;
// Un icono por capacidad, en el orden del copy (8 en total).
const CAP_ICONS = [Users, Receipt, Link2, Route, FileText, Activity, Wallet, Network] as const;

// Captura real de Logixtic por grupo (datos demostrativos). No se inventan interfaces ni métricas.
const VISUAL_SRC = [
  "/assets/02-gestion-comercial-resumen.webp",
  "/assets/04-seguimiento-operativo-pasos.webp",
  "/assets/06-costos-operacion.webp",
] as const;
const VISUAL_ALT = {
  es: [
    "Captura de Logixtic: resumen comercial (datos demostrativos)",
    "Captura de Logixtic: seguimiento operativo por pasos (datos demostrativos)",
    "Captura de Logixtic: costos y margen de la operación (datos demostrativos)",
  ],
  en: [
    "Logixtic screenshot: sales summary (demo data)",
    "Logixtic screenshot: step-by-step operation tracking (demo data)",
    "Logixtic screenshot: operation costs and margin (demo data)",
  ],
  pt: [
    "Captura da Logixtic: resumo comercial (dados demonstrativos)",
    "Captura da Logixtic: acompanhamento operacional por etapas (dados demonstrativos)",
    "Captura da Logixtic: custos e margem da operação (dados demonstrativos)",
  ],
} as const;

export function ZenoxPreviewServices() {
  const { locale } = useLanguage();
  const lang = previewLang(locale);
  const t = PREVIEW_COPY[lang].services;
  const [active, setActive] = useState(0);
  const group = t.groups[active] ?? t.groups[0];
  const groupKey = GROUP_KEYS[active] ?? GROUP_KEYS[0];
  const offset = t.groups.slice(0, active).reduce((n, g) => n + g.caps.length, 0);

  return (
    <section id="capacidades" className="zxp-services" aria-labelledby="zxp-services-title">
      <DataNetworkLayer variant="network" />
      <div className="zxp-section-head">
        <p className="zxp-kicker">{t.kicker}</p>
        <h2 id="zxp-services-title" className="zxp-h2">
          {t.h2}
        </h2>
      </div>

      <div className="zxp-rail" role="tablist" aria-label={t.tabsLabel}>
        {t.groups.map((g, i) => {
          const Icon = GROUP_ICONS[i] ?? TrendingUp;
          return (
            <button
              key={GROUP_KEYS[i]}
              type="button"
              role="tab"
              id={`zxp-svc-${GROUP_KEYS[i]}`}
              aria-selected={i === active}
              aria-controls="zxp-services-panel"
              tabIndex={i === active ? 0 : -1}
              className={`zxp-rail-node${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setActive((i + 1) % t.groups.length);
                if (e.key === "ArrowLeft") setActive((i - 1 + t.groups.length) % t.groups.length);
              }}
            >
              <span className="zxp-rail-icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="zxp-rail-text">
                <span className="zxp-rail-num">0{i + 1}</span>
                <span className="zxp-rail-name">{g.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="zxp-svc-body">
        <div
          id="zxp-services-panel"
          role="tabpanel"
          aria-labelledby={`zxp-svc-${groupKey}`}
          className="zxp-timeline"
          key={groupKey}
        >
          {group.caps.map((c, i) => {
            const Icon = CAP_ICONS[offset + i] ?? Network;
            return (
              <article key={c.name} className="zxp-step" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="zxp-step-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <div className="zxp-step-body">
                  <h3 className="zxp-cap-name">
                    {c.name}
                    {"pending" in c && c.pending ? (
                      <span className="zxp-pending">{t.pending}</span>
                    ) : null}
                  </h3>
                  <p className="zxp-cap-text">{c.text}</p>
                </div>
              </article>
            );
          })}
        </div>
        <figure className="zxp-svc-visual">
          <div className="zxp-svc-visual-frame">
            <img
              key={groupKey}
              src={VISUAL_SRC[active] ?? VISUAL_SRC[0]}
              alt={VISUAL_ALT[lang][active] ?? ""}
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>{group.name}</figcaption>
        </figure>
      </div>
    </section>
  );
}
