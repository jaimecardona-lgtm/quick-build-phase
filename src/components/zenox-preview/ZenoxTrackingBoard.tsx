import { Plane, Ship, Truck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { HeroWorldMap } from "@/components/zenox-preview/HeroWorldMap";
import { PREVIEW_MULTIMODAL, previewLang } from "@/components/zenox-preview/zenox-preview-copy";

// Trazabilidad multimodal de la vista previa: datos DEMOSTRATIVOS, rotulados. No es seguimiento real.
const MODE_ICONS = { sea: Ship, air: Plane, road: Truck } as const;

export function ZenoxTrackingBoard() {
  const { locale } = useLanguage();
  const t = PREVIEW_MULTIMODAL[previewLang(locale)];
  return (
    <section className="zxp-tracking" aria-label={t.kicker}>
      <HeroWorldMap />
      <div className="zxp-tracking-inner">
        <header className="zxp-tracking-head">
          <p className="zxp-kicker">{t.kicker}</p>
          <span className="zxp-tracking-demo">{t.note}</span>
        </header>
        <ol className="zxp-tracking-grid">
          {t.shipments.map((s) => {
            const Icon = MODE_ICONS[s.mode];
            return (
              <li key={s.mode} className="zxp-shipment" data-status={s.status}>
                <div className="zxp-shipment-top">
                  <span className="zxp-shipment-icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <span className="zxp-shipment-mode">{s.modeLabel}</span>
                  <span className="zxp-shipment-status">{t.status[s.status]}</span>
                </div>
                <div className="zxp-shipment-route">
                  <span className="zxp-shipment-city">{s.route[0]}</span>
                  <svg
                    className="zxp-shipment-path"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M2 14 Q50 -2 98 14" />
                  </svg>
                  <span className="zxp-shipment-city">{s.route[1]}</span>
                </div>
                <div className="zxp-shipment-bar" aria-hidden="true">
                  <span style={{ width: `${Math.round(s.progress * 100)}%` }} />
                </div>
                <p className="zxp-shipment-meta">
                  {t.eta} · {s.eta} · {Math.round(s.progress * 100)} %
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
