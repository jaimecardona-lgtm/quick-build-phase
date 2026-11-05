import { ArrowRight, Building2, FileClock, FileText, Route, Users } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { DemoButton } from "@/components/site/DemoButton";
import { CinematicBackgroundSequence } from "@/components/experience/CinematicBackgroundSequence";
import { CINEMATIC_CLIPS } from "@/lib/cinematic-media";
import { FORWARDERS_V2 } from "@/lib/cinematic-assets";
import { SCENE_SECTIONS, imageSceneFor, videoClipsFor } from "@/lib/visual-scenes";
import { SceneStill } from "@/components/experience/SceneStill";
import { FlowTransform } from "@/components/experience/FlowTransform";
import { DigitalTraceOverlay } from "@/components/experience/DigitalTraceOverlay";

// Operación física (terminal de contenedores) -> registro digital (escaneo) -> control en Logixtic.
const FLOW_CLIPS = FORWARDERS_V2
  ? videoClipsFor(SCENE_SECTIONS.flow)
  : [CINEMATIC_CLIPS.container_operations, CINEMATIC_CLIPS.scan];
const flowStill = FORWARDERS_V2 ? imageSceneFor(SCENE_SECTIONS.flow) : undefined;

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

export function Flow({ showResults = true }: { showResults?: boolean } = {}) {
  const { content, locale } = useLanguage();
  const { flow, portal } = content;
  const portalIcons = [Building2, Route, FileText, FileClock];
  const t = copy[(locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es") as keyof typeof copy];
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [manual, setManual] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const progress = useCountUp(resultsRef);
  const stage = flow.stages[active] ?? flow.stages[0];
  const total = flow.stages.length;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    flow.stages.forEach((s) => { if (s.image) { const img = new Image(); img.src = s.image; } });
  }, [flow.stages]);

  const running = inView && !hovering && !manual;
  useEffect(() => {
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % total), 4000);
    return () => window.clearTimeout(id);
  }, [running, active, total]);

  if (!stage) return null;

  const select = (index: number) => {
    const selected = flow.stages[index];
    if (!selected) return;
    setActive(index);
    setManual(true);
    track("flow_stage_select", { stage: selected.label, section_id: "plataforma" });
  };

  const hoverStage = (index: number) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActive(index), 180);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(index); return; }
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
      ref={sectionRef}
      className="section-shell surface-deep bgseq-host"
      onMouseLeave={() => { setHovering(false); setManual(false); }}
    >
      <CinematicBackgroundSequence clips={FLOW_CLIPS} />
      {flowStill ? <SceneStill scene={flowStill} className="scene-still-overlay" /> : null}
      <DigitalTraceOverlay />
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-4xl">
          <h2 id="plataforma-title" className="section-title-dark">{t.title}</h2>
          <p className="section-lead-dark mt-4 font-semibold !text-skybrand">{t.body}</p>
        </div>

        {FORWARDERS_V2 ? <FlowTransform /> : null}

        <div className="flow2-layout mt-10">
          <div className="flow2-media" onMouseEnter={() => setHovering(true)}>
            <figure className="product-frame flow-product-frame">
              <div className="flex h-10 items-center justify-between border-b border-on-dark/10 px-4">
                <span className="font-ui text-[10px] tracking-[0.16em] text-on-dark/55 uppercase">Logixtic® · {stage.label}</span>
                <span className="font-ui text-[10px] text-on-dark/45">{active + 1} / {total}</span>
              </div>
              <div className="relative aspect-[2/1] overflow-hidden bg-night" id="flow-panel" role="tabpanel" aria-label={stage.label}>
                {stage.image ? (
                  <img key={stage.image} src={stage.image} alt={stage.alt ?? ""} loading="lazy" className="flow2-image absolute inset-0 h-full w-full object-contain" />
                ) : (
                  <div key="portal" className="flow-portal absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden p-3 sm:gap-4 md:p-8">
                    <div className="flow-portal-in" style={{ animationDelay: "0ms" }}>
                      <h3 className="font-display text-sm font-semibold text-on-dark sm:text-lg md:text-2xl">{portal.title}</h3>
                      <p className="mt-2 hidden max-w-2xl font-ui text-xs sm:block leading-relaxed text-on-dark/75 md:text-sm">{portal.body}</p>
                    </div>
                    <ol className="flow-portal-in flex flex-nowrap items-center gap-1 sm:gap-2" style={{ animationDelay: "150ms" }}>
                      {portal.diagram.map((node, i) => (
                        <li key={node} className="flex min-w-0 items-center gap-1 sm:gap-2">
                          <span className="diagram-node !gap-1 !px-2 !py-1 text-[10px] sm:!px-3 sm:!py-2 sm:text-xs">
                            {i === 1 ? <Building2 className="h-4 w-4 text-amber" aria-hidden="true" /> : <Users className="h-4 w-4 text-skybrand" aria-hidden="true" />}
                            {node}
                          </span>
                          {i < portal.diagram.length - 1 && <ArrowRight className="h-3 w-3 shrink-0 text-on-dark/40" aria-hidden="true" />}
                        </li>
                      ))}
                    </ol>
                    <ul className="flow-portal-in grid grid-cols-2 gap-x-2 gap-y-0 sm:gap-2" style={{ animationDelay: "300ms" }}>
                      {portal.benefits.map((b, i) => {
                        const Icon = portalIcons[i] ?? FileText;
                        return <li key={b} className="portal-proof-item !py-1 text-[10px] sm:!py-2 sm:text-xs md:text-sm"><Icon aria-hidden="true" /><span>{b}</span></li>;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </figure>
          </div>

          <div className="flow2-menu" onMouseEnter={() => setHovering(true)} onMouseLeave={() => window.clearTimeout(hoverTimer.current)} role="tablist" aria-orientation="vertical" aria-label={t.stagesLabel}>
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
                onMouseEnter={() => hoverStage(index)}
                className="focus-ring stage-button flow2-stage"
                data-on={active === index}
              >
                <span className="stage-signal" aria-hidden="true" />
                <span className="font-ui text-[11px] font-semibold tracking-[0.16em] text-skybrand">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-1 block font-display text-base font-semibold text-on-dark">{item.label}</span>
                <span className="mt-1 block font-ui text-sm leading-relaxed text-on-dark/75">{item.body}</span>
                {active === index && <span key={`p${active}`} className="flow2-progress" data-run={running} aria-hidden="true" />}
              </button>
            ))}
          </div>

          <div ref={resultsRef} className="flow2-results" data-lit={progress > 0}>
            {showResults ? (
              <>
                <h3 className="title-panel">{t.resultsTitle}</h3>
                <dl className="flow2-metrics">
                  {metrics.map((m, i) => (
                    <div key={i} className="flow2-metric" data-accent={i === 1}>
                      <dt className="sr-only">{t.results[i]}</dt>
                      <dd className="flow2-number" aria-label={`${m.value}${m.suffix}`}>
                        <span aria-hidden="true">{Math.round(m.value * progress)}{m.suffix}</span>
                      </dd>
                      <dd className="mt-2 font-ui text-sm leading-snug text-on-dark/80" aria-hidden="true">{t.results[i]}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
            <div className="flow2-cta">
              <DemoButton sectionId="plataforma" size="lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
