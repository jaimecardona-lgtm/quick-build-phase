import { useEffect, useRef, useState } from "react";
import { evidence } from "@/lib/content";
import { track } from "@/lib/analytics";

function parseCount(value: string) {
  if (!/^\d[\d.]*$/.test(value)) return null;
  return Number(value.replaceAll(".", ""));
}

function formatCount(value: number) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);
}

function CountUpValue({ value }: { value: string }) {
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
        setDisplay(formatCount(Math.round(target * eased)));
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
  }, [target, value]);

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
  const [active, setActive] = useState(0);
  const current = evidence.cases[active] ?? evidence.cases[0];

  if (!current) return null;

  return (
    <section id="clientes" aria-labelledby="clientes-title" className="section-shell surface-mid">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">Evidencia</p>
          <h2 id="clientes-title" className="section-title-dark mt-4">
            {evidence.title}
          </h2>
          <p className="section-lead-dark mt-5">{evidence.body}</p>
        </div>

        <ul data-reveal className="reveal-item client-strip mt-12">
          {evidence.companies.map((company) => (
            <li key={company} className="client-logo-text">
              {company}
            </li>
          ))}
        </ul>

        <dl data-reveal className="reveal-item mt-12 grid gap-5 md:grid-cols-3">
          {evidence.metrics.map((metric) => (
            <div key={metric.label} className="panel-dark">
              <dt className="font-display text-2xl font-semibold text-on-dark md:text-3xl">
                <CountUpValue value={metric.value} />
              </dt>
              <dd className="mt-2 font-ui text-sm text-on-dark/62">{metric.label}</dd>
            </div>
          ))}
        </dl>

        <div data-reveal className="reveal-item mt-12">
          <div role="tablist" aria-label="Casos de éxito" className="flex flex-wrap gap-2">
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
