import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { PREVIEW_COPY, previewLang } from "@/components/zenox-preview/zenox-preview-copy";

// Ocho capacidades oficiales en tres grupos. Textos literales del documento (ES); EN/PT son borradores.
const GROUP_KEYS = ["comercial", "operativa", "rentabilidad"] as const;

export function ZenoxPreviewServices() {
  const { locale } = useLanguage();
  const t = PREVIEW_COPY[previewLang(locale)].services;
  const [active, setActive] = useState(0);
  const group = t.groups[active] ?? t.groups[0];
  const groupKey = GROUP_KEYS[active] ?? GROUP_KEYS[0];

  return (
    <section id="capacidades" className="zxp-services" aria-labelledby="zxp-services-title">
      <div className="zxp-section-head">
        <p className="zxp-kicker">{t.kicker}</p>
        <h2 id="zxp-services-title" className="zxp-h2">
          {t.h2}
        </h2>
      </div>

      <div className="zxp-services-grid">
        <ul className="zxp-services-list" role="tablist" aria-label={t.tabsLabel}>
          {t.groups.map((g, i) => (
            <li key={GROUP_KEYS[i]}>
              <button
                type="button"
                role="tab"
                id={`zxp-svc-${GROUP_KEYS[i]}`}
                aria-selected={i === active}
                aria-controls="zxp-services-panel"
                className={`zxp-svc-row${i === active ? " is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                <span className="zxp-svc-num">0{i + 1}</span>
                <span className="zxp-svc-name">{g.name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div
          id="zxp-services-panel"
          role="tabpanel"
          aria-labelledby={`zxp-svc-${groupKey}`}
          className="zxp-services-panel"
          key={groupKey}
        >
          {group.caps.map((c) => (
            <article key={c.name} className="zxp-cap">
              <h3 className="zxp-cap-name">
                {c.name}
                {"pending" in c && c.pending ? (
                  <span className="zxp-pending">{t.pending}</span>
                ) : null}
              </h3>
              <p className="zxp-cap-text">{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
