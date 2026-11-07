import type { MouseEvent } from "react";
import { track } from "@/lib/analytics";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import { ZX_HERO, ZX_NAV, ZX_ROI } from "./zenox-copy";
import { openLogixWidget, useDemoUrl } from "./zenox-actions";

/* Header compacto de la variante Zenox. Anclas reales dentro de la página y enlace externo solo a Recursos. */
export function ZenoxHeader() {
  const onRoi = (e: MouseEvent<HTMLAnchorElement>) => openLogixWidget(e, "header_roi");
  const demoHref = useDemoUrl();

  return (
    <header className="zx-header">
      <div className="zx-header-inner">
        <a href="#inicio" className="zx-brand" aria-label="Logixtic, inicio">
          <img src="/assets/logixtic-logo-negativo-transparente.png" alt="Logixtic" width={1520} height={465} />
        </a>

        <nav aria-label="Principal" className="zx-nav">
          <ul>
            {ZX_NAV.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href="#diagnostico-roi" onClick={onRoi}>
                {ZX_ROI.label}
              </a>
            </li>
          </ul>
        </nav>

        <div className="zx-header-actions">
          <LanguageSelector />
          <a
            className="zx-btn zx-btn--small"
            href={demoHref}
            onClick={() => track("zenox_cta_click", { section_id: "header", cta: "agenda_diagnostico" })}
          >
            {ZX_HERO.ctaPrimary}
          </a>
        </div>

        <details className="zx-menu">
          <summary aria-label="Abrir menú">Menú</summary>
          <ul>
            {ZX_NAV.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href="#diagnostico-roi" onClick={onRoi}>
                {ZX_ROI.label}
              </a>
            </li>
            <li>
              <a href={demoHref}>{ZX_HERO.ctaPrimary}</a>
            </li>
          </ul>
        </details>
      </div>
    </header>
  );
}
