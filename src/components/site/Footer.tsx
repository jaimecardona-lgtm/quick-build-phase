import { companyLink, nav, resourceLinks } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-deep border-t border-on-dark/10 py-16">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <img
              src="/assets/logixtic-logo-negativo-transparente.png"
              alt="Logixtic"
              width={1520}
              height={465}
              className="h-7 w-auto"
            />
            <p className="mt-4 font-ui text-sm text-on-dark/60">Simplify Your Logistics</p>
            <a
              href="mailto:info@logixtic.co"
              className="focus-ring mt-6 inline-block rounded-md font-ui text-sm text-skybrand hover:underline"
            >
              info@logixtic.co
            </a>
          </div>
          <nav aria-label="Navegación del sitio">
            <h2 className="font-ui text-[11px] font-semibold tracking-[0.16em] text-on-dark/50 uppercase">
              Logixtic®
            </h2>
            <ul className="mt-4 space-y-2.5">
              {nav.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="focus-ring rounded-md font-ui text-sm text-on-dark/70 hover:text-on-dark">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <span aria-disabled="true" className="rounded-md font-ui text-sm text-on-dark/34">
                  {companyLink.label}
                </span>
              </li>
            </ul>
          </nav>
          <nav aria-label="Recursos">
            <h2 className="font-ui text-[11px] font-semibold tracking-[0.16em] text-on-dark/50 uppercase">
              Recursos
            </h2>
            <ul className="mt-4 space-y-2.5">
              {resourceLinks.map((item) => (
                <li key={item.label}>
                  {item.available ? (
                    <a href={item.href} className="focus-ring rounded-md font-ui text-sm text-on-dark/70 hover:text-on-dark">
                      {item.label}
                    </a>
                  ) : (
                    <span aria-disabled="true" className="rounded-md font-ui text-sm text-on-dark/34">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-on-dark/10 pt-6 font-ui text-xs text-on-dark/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Logixtic®. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a
              href="https://www.logixtic.co/politica-de-privacidad"
              rel="noopener noreferrer"
              className="focus-ring rounded-md hover:text-on-dark"
            >
              Política de privacidad
            </a>
            <a
              href="https://www.logixtic.co/terminos-y-condiciones"
              rel="noopener noreferrer"
              className="focus-ring rounded-md hover:text-on-dark"
            >
              Términos y condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
