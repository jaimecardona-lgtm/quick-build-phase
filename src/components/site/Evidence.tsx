import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import rrLogo from "@/assets/logo-rr-logistics-cfs.png.asset.json";
import connectaLogo from "@/assets/logo-connecta-global-logistics.png.asset.json";
import tradeLogo from "@/assets/logo-trade-business-sas.png.asset.json";

const companyLogos = [
  { name: "R&R Logistics CFS", src: rrLogo.url, className: "client-logo-rr" },
  { name: "Connecta Global Logistics", src: connectaLogo.url, className: "client-logo-connecta" },
  { name: "Trade & Business SAS", src: tradeLogo.url, className: "client-logo-trade" },
];

function parseCount(value: string) {
  if (!/^\d[\d.]*$/.test(value)) return null;
  return Number(value.replaceAll(".", ""));
}

function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function CountUpValue({ value, locale }: { value: string; locale: string }) {
  const target = parseCount(value);
  const ref = useRef<HTMLElement>(null);
  const hasRun = useRef(false);
  const [display, setDisplay] = useState(target === null ? value : "0");

  useEffect(() => {
    if (target === null) return;
    const node = ref.current;
    if (!node) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      setDisplay(value);
      hasRun.current = true;
      return;
    }

    let frame = 0;
    const run = () => {
      if (hasRun.current) return;
      hasRun.current = true;
      const duration = target > 1000 ? 1500 : 1250;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(formatCount(Math.round(target * eased), locale));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setDisplay(value);
        }
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [locale, target, value]);

  if (target === null) {
    return <span>{value}</span>;
  }

  return (
    <span ref={ref} aria-label={value}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}

export function Evidence() {
  const { content, locale } = useLanguage();
  const { evidence, ui } = content;
  const [active, setActive] = useState(0);
  const current = evidence.cases[active] ?? evidence.cases[0];

  if (!current) return null;

  return (
    <section id="clientes" aria-labelledby="clientes-title" className="section-shell surface-mid">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">{ui.evidenceKicker}</p>
          <h2 id="clientes-title" className="section-title-dark mt-4">
            {evidence.title}
          </h2>
          <p className="section-lead-dark mt-5">{evidence.body}</p>
        </div>

        <ul data-reveal className="reveal-item client-strip mt-10">
          {companyLogos.map((company) => (
            <li key={company.name} className="client-logo-item">
              <img src={company.src} alt={company.name} className={company.className} loading="lazy" />
            </li>
          ))}
        </ul>

        <div data-reveal className="reveal-item evidence-impact mt-12">
          <dl className="evidence-metrics">
            {evidence.metrics.slice(0, 2).map((metric) => (
              <div key={metric.label} className="evidence-metric">
                <dt className="font-display font-semibold text-on-dark">
                   <CountUpValue value={metric.value} locale={locale === "pt-BR" ? "pt-BR" : locale === "en" ? "en-US" : "es-CO"} />
                </dt>
                <dd className="mt-3 font-ui text-sm leading-relaxed text-on-dark/62">{metric.label}</dd>
              </div>
            ))}
          </dl>
          <figure className="presence-map">
            <figcaption>{ui.regionalPresence}</figcaption>
            <svg viewBox="0 0 520 330" role="img" aria-label={ui.mapLabel}>
              <path className="map-land" d="M94 36 128 22l54 7 28 21 29 8 19 31-10 21-25 4-10 18-25 6-17 21-21-8-14-21-25-5-16-25-21-12 6-19-15-17 15-13Z" />
              <path className="map-land" d="m188 145 23 4 17 16 24 4 18 17-8 15-18-1-10 15-20-8-15-17-20-5-8-15Z" />
              <path className="map-land" d="m261 197 26-11 38 13 28 30-2 34-19 22-16 30-29-9-18-31-6-29-18-28Z" />
              <path className="map-land map-florida" d="m258 112 18 5 9 25-8 22-8-19-15-12Z" />
              <circle className="map-point" cx="277" cy="142" r="5" />
              <circle className="map-point" cx="226" cy="186" r="5" />
              <circle className="map-point" cx="276" cy="217" r="5" />
              <text x="290" y="140">Florida</text>
              <text x="184" y="181">{locale === "en" ? "Panama" : "Panamá"}</text>
              <text x="290" y="221">{locale === "pt-BR" ? "Colômbia" : "Colombia"}</text>
            </svg>
          </figure>
        </div>

        <div data-reveal className="reveal-item mt-12">
          <div role="tablist" aria-label={ui.successCases} className="flex flex-wrap gap-2">
            {evidence.cases.map((item, index) => (
              <button
                key={item.company}
                type="button"
                role="tab"
                id={`caso-tab-${index}`}
                aria-selected={active === index}
                aria-controls={`caso-panel-${index}`}
                onClick={() => {
                  setActive(index);
                  track("case_select", { company: item.company, section_id: "clientes" });
                }}
                className="focus-ring tab-button"
                data-on={active === index}
              >
                {item.company}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`caso-panel-${active}`}
            aria-labelledby={`caso-tab-${active}`}
            className="panel-dark mt-5"
          >
            <h3 className="font-display text-lg font-semibold text-on-dark">{current.company}</h3>
            <p className="mt-3 max-w-2xl font-ui text-sm leading-relaxed text-on-dark/72">{current.result}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
