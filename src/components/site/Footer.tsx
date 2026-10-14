import { useLanguage } from "@/lib/i18n";
import oea from "@/assets/compliance/oea-colombia.webp.asset.json";
import basc from "@/assets/compliance/basc-official.svg.asset.json";
import paperless from "@/assets/compliance/paperless.png.asset.json";
import zerowaste from "@/assets/compliance/zerowaste.png.asset.json";

const badges = [
  { id: "oea", src: oea.url, label: "OEA Colombia" },
  { id: "basc", src: basc.url, label: "BASC" },
  { id: "iso", label: "ISO 28000" },
  { id: "paperless", src: paperless.url, label: "Paperless" },
  { id: "zerowaste", src: zerowaste.url, label: "Zero Waste" },
];

const latamCopy = {
  es: { kicker: "Operación LATAM", body: "Apoyamos la operación y los procesos de cumplimiento de empresas en LATAM.", standard: "Norma", standardLabel: "Referencia a la norma ISO 28000; no es un sello de certificación" },
  en: { kicker: "LATAM operations", body: "We support the operations and compliance processes of companies in LATAM.", standard: "Standard", standardLabel: "Reference to the ISO 28000 standard; not a certification seal" },
  "pt-BR": { kicker: "Operação LATAM", body: "Apoiamos a operação e os processos de conformidade de empresas na LATAM.", standard: "Norma", standardLabel: "Referência à norma ISO 28000; não é um selo de certificação" },
} as const;

export function Footer() {
  const year = new Date().getFullYear();
  const { content, locale } = useLanguage();
  const latam = latamCopy[locale as keyof typeof latamCopy] ?? latamCopy.es;
  const { companyLink, nav, resourceLinks, ui } = content;

  return (
    <footer className="surface-deep border-t border-on-dark/10 py-12">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto_auto] lg:grid-cols-[minmax(0,1fr)_auto_auto_minmax(0,430px)] md:gap-x-12">
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
          <nav aria-label={ui.siteNavigation}>
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
          <nav aria-label={ui.resources}>
            <h2 className="font-ui text-[11px] font-semibold tracking-[0.16em] text-on-dark/50 uppercase">
              {ui.resources}
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
          <div className="footer-latam md:col-span-3 lg:col-span-1 lg:self-start">
            <p className="font-ui text-[11px] font-semibold tracking-[0.16em] text-skybrand uppercase">{latam.kicker}</p>
            <p className="mt-1.5 font-ui text-sm text-on-dark/75">{latam.body}</p>
            <ul className="footer-badges">
              {badges.map((b) => (
                <li key={b.id} className="footer-badge" data-badge={b.id}>
                  <span className="footer-badge-img">
                    {b.src ? (
                      <img src={b.src} alt={b.label} loading="lazy" />
                    ) : (
                      <span className="footer-standard font-ui" aria-label={latam.standardLabel}>ISO<br />28000</span>
                    )}
                  </span>
                  <span className="font-ui text-[10px] font-semibold text-on-dark/70 uppercase">{b.id === "iso" ? latam.standard : b.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-on-dark/10 pt-6 font-ui text-xs text-on-dark/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Logixtic®. {ui.rights}</p>
          <div className="flex gap-6">
            <a
              href="https://www.logixtic.co/politica-de-privacidad"
              rel="noopener noreferrer"
              className="focus-ring rounded-md hover:text-on-dark"
            >
              {ui.privacy}
            </a>
            <a
              href="https://www.logixtic.co/terminos-y-condiciones"
              rel="noopener noreferrer"
              className="focus-ring rounded-md hover:text-on-dark"
            >
              {ui.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
