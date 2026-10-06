import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Layers } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";

const copy = {
  es: {
    title: "Digitalice todos los procesos manuales con una sola plataforma.",
    body: "Elimine las tareas de ingreso de datos. Deje que su equipo se ocupe de los problemas reales.",
    resultsTitle: "Resultados probados en batalla",
    stagesLabel: "Etapas del proceso",
    results: ["Ingresos por empleado operativo", "Menos tiempo dedicado a la introducción de datos", "Aumento de la velocidad de ventas"],
  },
  en: {
    title: "Digitize every manual process with a single platform.",
    body: "Eliminate data entry tasks. Let your team focus on the real problems.",
    resultsTitle: "Battle-tested results",
    stagesLabel: "Process stages",
    results: ["Revenue per operations employee", "Less time spent on data entry", "Increase in sales velocity"],
  },
  pt: {
    title: "Digitalize todos os processos manuais com uma única plataforma.",
    body: "Elimine as tarefas de digitação de dados. Deixe sua equipe cuidar dos problemas reais.",
    resultsTitle: "Resultados comprovados na prática",
    stagesLabel: "Etapas do processo",
    results: ["Receita por colaborador operacional", "Menos tempo dedicado à digitação de dados", "Aumento da velocidade de vendas"],
  },
} as const;

const metrics = [
  { value: 3, suffix: "×" },
  { value: 70, suffix: " %" },
  { value: 2, suffix: "×" },
];

function useCountUp(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setProgress(1); return; }
    let raf = 0;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1100);
        setProgress(1 - Math.pow(1 - t, 3));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [ref]);
  return progress;
}

export function Flow() {
  const { content, locale } = useLanguage();
  const { flow } = content;
  const t = copy[(locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es") as keyof typeof copy];
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [manual, setManual] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const progress = useCountUp(resultsRef);
  const stage = flow.stages[active] ?? flow.stages[0];
  const total = flow.stages.length;

  useEffect(() => {
    if (hovering || manual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % total), 5000);
    return () => window.clearInterval(id);
  }, [hovering, manual, total]);

  if (!stage) return null;

  const select = (index: number) => {
    const selected = flow.stages[index];
    if (!selected) return;
    setActive(index);
    setManual(true);
    track("flow_stage_select", { stage: selected.label, section_id: "plataforma" });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + total) % total;
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="plataforma"
      aria-labelledby="plataforma-title"
      className="section-shell surface-deep"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setManual(false); }}
    >
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-4xl">
          <h2 id="plataforma-title" className="section-title-dark">{t.title}</h2>
          <p className="section-lead-dark mt-4 font-semibold !text-skybrand">{t.body}</p>
        </div>

        <div className="flow2-layout mt-10">
          <div className="flow2-media">
            <figure className="product-frame flow-product-frame">
              <div className="flex h-10 items-center justify-between border-b border-on-dark/10 px-4">
                <span className="font-ui text-[10px] tracking-[0.16em] text-on-dark/55 uppercase">Logixtic® · {stage.label}</span>
                <span className="font-ui text-[10px] text-on-dark/45">{active + 1} / {total}</span>
              </div>
              <div className="relative aspect-[2/1] overflow-hidden bg-night" id="flow-panel" role="tabpanel" aria-label={stage.label}>
                {stage.image ? (
                  <img key={stage.image} src={stage.image} alt={stage.alt ?? ""} loading="lazy" className="flow2-image absolute inset-0 h-full w-full object-contain" />
                ) : (
                  <div key="empty" className="flow2-image absolute inset-0 flex flex-col items-center justify-center gap-3 text-on-dark/60">
                    <Layers className="h-7 w-7 text-skybrand" aria-hidden="true" />
                    <p className="max-w-xs px-6 text-center font-ui text-sm">{stage.body}</p>
                  </div>
                )}
              </div>
            </figure>
          </div>

          <div className="flow2-menu" role="tablist" aria-orientation="vertical" aria-label={t.stagesLabel}>
            {flow.stages.map((item, index) => (
              <button
                key={item.label}
                ref={(el) => { tabRefs.current[index] = el; }}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-controls="flow-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(e) => onKey(e, index)}
                className="focus-ring stage-button flow2-stage"
                data-on={active === index}
              >
                <span className="stage-signal" aria-hidden="true" />
                <span className="font-ui text-[11px] font-semibold tracking-[0.16em] text-skybrand">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-1 block font-display text-base font-semibold text-on-dark">{item.label}</span>
                <span className="mt-1 block font-ui text-sm leading-relaxed text-on-dark/70">{item.body}</span>
              </button>
            ))}
          </div>

          <div ref={resultsRef} className="flow2-results">
            <h3 className="font-display text-2xl font-semibold text-on-dark md:text-3xl">{t.resultsTitle}</h3>
            <dl className="flow2-metrics">
              {metrics.map((m, i) => (
                <div key={i} className="flow2-metric">
                  <dt className="sr-only">{t.results[i]}</dt>
                  <dd className="flow2-number" aria-label={`${m.value}${m.suffix}`}>
                    <span aria-hidden="true">{Math.round(m.value * progress)}{m.suffix}</span>
                  </dd>
                  <dd className="mt-2 font-ui text-sm leading-snug text-on-dark/80" aria-hidden="true">{t.results[i]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
