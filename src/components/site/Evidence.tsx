import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { MAP_H, MAP_W, mapCountries, mapPoints } from "@/lib/americas-map";
import rrLogo from "@/assets/logo-rr-logistics-cfs.png.asset.json";
import connectaLogo from "@/assets/logo-connecta-global-logistics.png.asset.json";
import tradeLogo from "@/assets/logo-trade-business-sas.png.asset.json";

const logos = [rrLogo.url, connectaLogo.url, tradeLogo.url];

const copy = {
  es: {
    kicker: "Resultados y presencia regional",
    title: ["Más control por embarque.", "Más capacidad para crecer."],
    body: "Reduce tareas manuales, recupera tiempo y controla el margen de cada embarque, desde la cotización hasta la liquidación final.",
    metrics: ["Operaciones globales gestionadas", "Agentes de carga han probado la plataforma"],
    presence: "Presencia regional",
    rr: "Más de 20 % de reducción de costos operativos y 35 % de mejora en tiempos de respuesta.",
    places: { florida: "Florida", panama: "Panamá", colombia: "Colombia", venezuela: "Venezuela" },
  },
  en: {
    kicker: "Results and regional presence",
    title: ["More control per shipment.", "More capacity to grow."],
    body: "Reduce manual tasks, recover time and control the margin of every shipment, from quotation to final settlement.",
    metrics: ["Global operations managed", "Freight forwarders have tried the platform"],
    presence: "Regional presence",
    rr: "Over 20% reduction in operating costs and 35% improvement in response times.",
    places: { florida: "Florida", panama: "Panama", colombia: "Colombia", venezuela: "Venezuela" },
  },
  pt: {
    kicker: "Resultados e presença regional",
    title: ["Mais controle por embarque.", "Mais capacidade para crescer."],
    body: "Reduza tarefas manuais, recupere tempo e controle a margem de cada embarque, da cotação à liquidação final.",
    metrics: ["Operações globais gerenciadas", "Agentes de carga já testaram a plataforma"],
    presence: "Presença regional",
    rr: "Mais de 20% de redução nos custos operacionais e 35% de melhoria nos tempos de resposta.",
    places: { florida: "Flórida", panama: "Panamá", colombia: "Colômbia", venezuela: "Venezuela" },
  },
} as const;

const highlighted = new Set(["PAN", "COL", "VEN"]);

function CountUp({ target, locale }: { target: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const fmt = (v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(v);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { setN(target); return; }
    let raf = 0;
    const obs = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const dur = target > 1000 ? 1500 : 1250;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        setN(p < 1 ? Math.round(target * (1 - Math.pow(1 - p, 3))) : target);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [target]);
  return (
    <span ref={ref}>
      <span className="sr-only">{fmt(target)}</span>
      <span aria-hidden="true">{fmt(n)}</span>
    </span>
  );
}

export function Evidence() {
  const { content, locale } = useLanguage();
  const { evidence, ui } = content;
  const t = copy[locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es"];
  const numLocale = locale.startsWith("pt") ? "pt-BR" : locale.startsWith("en") ? "en-US" : "es-CO";
  const [active, setActive] = useState(0);
  const [hot, setHot] = useState<string | null>(null);
  const [mapOn, setMapOn] = useState(false);
  const mapRef = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setMapOn(!!e?.isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cases = evidence.cases.map((c, i) => (i === 0 ? { ...c, result: t.rr } : c));
  const current = cases[active] ?? cases[0];
  if (!current) return null;

  const select = (i: number) => {
    setActive(i);
    track("case_select", { company: cases[i]?.company ?? "", section_id: "clientes" });
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + cases.length) % cases.length;
    select(n);
    tabs.current[n]?.focus();
  };

  const places = [
    { key: "florida", side: "r" },
    { key: "panama", side: "l" },
    { key: "colombia", side: "r" },
    { key: "venezuela", side: "t" },
  ] as const;

  return (
    <section id="clientes" aria-labelledby="clientes-title" className="section-shell surface-mid">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="ev3-main">
          <div data-reveal className="reveal-item ev3-content">
            <p className="section-kicker">{t.kicker}</p>
            <h2 id="clientes-title" className="section-title-dark mt-4">
              {t.title[0]}<br />{t.title[1]}
            </h2>
            <p className="section-lead-dark mt-5">{t.body}</p>
            <dl className="ev3-metrics mt-8">
              {[17543, 699].map((v, i) => (
                <div key={v} className="ev3-metric">
                  <dt className="sr-only">{t.metrics[i]}</dt>
                  <dd className="ev3-number font-display"><CountUp target={v} locale={numLocale} /></dd>
                  <dd className="ev3-label font-ui" aria-hidden="true">{t.metrics[i]}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure ref={mapRef} className="ev3-map" data-on={mapOn}>
            <figcaption className="font-display">{t.presence}</figcaption>
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={ui.mapLabel}>
              {mapCountries.map((c) => (
                <path key={c.id} d={c.d} className="ev3-land" data-hl={highlighted.has(c.id)} />
              ))}
              {places.map(({ key, side }) => {
                const [x, y] = mapPoints[key];
                const label = t.places[key];
                const w = label.length * 7.4 + 20;
                const lx = side === "r" ? x + 12 : side === "t" ? x - w / 2 : x - 12 - w;
                const ly = side === "t" ? y - 26 : y;
                return (
                  <g
                    key={key}
                    className="ev3-place"
                    data-hot={hot === key}
                    tabIndex={0}
                    role="img"
                    aria-label={label}
                    onMouseEnter={() => setHot(key)}
                    onMouseLeave={() => setHot(null)}
                    onFocus={() => setHot(key)}
                    onBlur={() => setHot(null)}
                    onTouchStart={() => setHot(key)}
                  >
                    <circle className="ev3-pulse" cx={x} cy={y} r="6" />
                    <circle className="ev3-dot" cx={x} cy={y} r="6" />
                    <rect x={lx} y={ly - 12} width={w} height="24" rx="12" className="ev3-tag" />
                    <text x={lx + w / 2} y={ly + 4.5} textAnchor="middle">{label}</text>
                  </g>
                );
              })}
            </svg>
          </figure>
        </div>

        <div data-reveal className="reveal-item ev3-cases mt-10">
          <div role="tablist" aria-label={ui.successCases} className="ev3-tabs">
            {cases.map((item, index) => (
              <button
                key={item.company}
                ref={(el) => { tabs.current[index] = el; }}
                type="button"
                role="tab"
                id={`caso-tab-${index}`}
                aria-selected={active === index}
                aria-controls="caso-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(e) => onKey(e, index)}
                className="focus-ring ev3-tab"
                data-on={active === index}
              >
                <img src={logos[index]} alt="" className="ev3-logo" loading="lazy" />
                <span>{item.company}</span>
              </button>
            ))}
          </div>
          <div role="tabpanel" id="caso-panel" aria-labelledby={`caso-tab-${active}`} className="ev3-panel">
            <div key={active} className="ev3-panel-in">
              <h3 className="title-h3 text-on-dark">{current.company}</h3>
              <p className="mt-2 font-ui text-sm leading-relaxed text-on-dark/80 md:text-base">{current.result}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
