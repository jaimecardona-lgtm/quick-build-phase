import { ZX_FOOTER, ZX_NAV } from "./zenox-copy";

/* Vuelve al inicio de la página; el foco pasa al logotipo del encabezado (siempre visible y enfocable). */
function backToTop() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  window.setTimeout(() => document.querySelector<HTMLElement>(".zx-brand")?.focus({ preventScroll: true }), reduced ? 0 : 600);
}

/* Footer Zenox: solo enlaces reales. Sin redes sociales ni direcciones no confirmadas. */
export function ZenoxFooter() {
  return (
    <footer className="zx-footer">
      <div className="zx-footer-inner reveal-item" data-reveal>
        <a href="#inicio" className="zx-brand" aria-label="Logixtic, inicio">
          <img src="/assets/logixtic-logo-negativo-transparente.png" alt="Logixtic" width={1520} height={465} />
        </a>
        <p className="zx-footer-tagline">{ZX_FOOTER.tagline}</p>

        <nav aria-label="Pie de página" className="zx-footer-nav">
          <ul>
            {ZX_NAV.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href={ZX_FOOTER.privacy.href}>{ZX_FOOTER.privacy.label}</a>
            </li>
            <li>
              <a href={ZX_FOOTER.terms.href}>{ZX_FOOTER.terms.label}</a>
            </li>
            <li>
              <a href={ZX_FOOTER.email.href}>{ZX_FOOTER.email.label}</a>
            </li>
          </ul>
        </nav>
        <button type="button" className="zx-totop focus-ring" onClick={backToTop}>
          Volver arriba
        </button>
      </div>
    </footer>
  );
}
