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
import { DigitalTraceOverlay } from "@/components/experience/DigitalTraceOverlay";
import { FlowTransform } from "@/components/experience/FlowTransform";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./zenox-flow.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * Digitalización y flujo operativo de ocho etapas (versión Zenox de la Home).
 * - Textos y capturas reales: content.flow (mismas ocho etapas) y public/assets.
 * - Capturas apiladas: cada etapa cambia por opacidad, sin remontar ni dejar pantallas vacías.
 * - Progreso: línea que se llena hasta la etapa activa; nodos en estado completado, actual o pendiente.
 * - Interacción: clic/toque, teclado (flechas, Inicio, Fin, Intro, Espacio). Autoplay solo mientras la sección
 *   está visible, sin interacción y sin movimiento reducido; se detiene al primer uso manual.
 * - Movimiento de la captura asociado al scroll (transform, sin layout). Desactivado en móvil y movimiento reducido.
 * El componente site/Flow sigue igual para /legacy-home y /zenox-preview.
 */

const FLOW_CLIPS = FORWARDERS_V2
  ? videoClipsFor(SCENE_SECTIONS.flow)
  : [CINEMATIC_CLIPS.container_operations, CINEMATIC_CLIPS.scan];
const flowStill = FORWARDERS_V2 ? imageSceneFor(SCENE_SECTIONS.flow) : undefined;

const AUTOPLAY_MS = 5000;
const SCROLL_TRAVEL_PX = 36;

const HEAD = {
  title: "Digitalice todos los procesos manuales con una sola plataforma.",
  body: "Elimine las tareas de ingreso de datos. Deje que su equipo se ocupe de los problemas reales.",
  stagesLabel: "Etapas del proceso",
};

export function ZenoxFlow() {
  const { content } = useLanguage();
  const { flow, portal } = content;
  const stages = flow.stages;
  const total = stages.length;
  const portalIcons = [Building2, Route, FileText, FileClock];

  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [manual, setManual] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const headRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);

  const stage = stages[active] ?? stages[0];
  const fraction = total > 1 ? active / (total - 1) : 0;

  // Visibilidad de la sección: el autoplay solo corre mientras está en pantalla.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Precarga de capturas para que el cambio entre etapas no muestre huecos.
  useEffect(() => {
    stages.forEach((s) => {
      if (s.image) {
        const img = new Image();
        img.src = s.image;
      }
    });
  }, [stages]);

  // Autoplay: una sola temporización activa; se cancela al cambiar cualquier condición.
  const running = inView && !hovering && !manual;
  useEffect(() => {
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [running, active, total]);

  // Movimiento de la captura asociado al scroll: solo transform, con rAF y sin re-renders.
  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 960) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      frame.style.transform = `translate3d(0, ${((0.5 - p) * SCROLL_TRAVEL_PX).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      frame.style.transform = "";
    };
  }, []);

  // Rompecabezas: el titular, la captura, la línea de progreso y los nodos se ensamblan al entrar
  // y se separan al salir. Un único timeline con scrub: funciona igual al subir y al bajar.
  // Solo transform y opacity, y solo en piezas sin estado propio (los nodos animan x, no opacidad).
  // Con movimiento reducido no hay timeline: el contenido queda en su posición final.
  useEffect(() => {
    const section = sectionRef.current;
    const head = headRef.current;
    const product = productRef.current;
    const menu = menuRef.current;
    const track = trackRef.current;
    if (!section || !head || !product || !menu || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const d = window.innerWidth >= 960 ? 90 : 32;
    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<HTMLElement>(menu.querySelectorAll(".zx-flow-stage-btn"));
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top 85%", end: "bottom 15%", scrub: 0.4 },
      });
      // Ensamblaje (0 – 0.34): al llegar al centro de la sección, todo está completo y legible.
      // Nunca desde opacidad 0: el contenido siempre se percibe; el ensamblaje va en posición y escala.
      tl.fromTo(head, { y: 48, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.12 }, 0)
        .fromTo(product, { x: -d, scale: 0.96, opacity: 0.55 }, { x: 0, scale: 1, opacity: 1, duration: 0.18 }, 0.04)
        .fromTo(track, { scaleY: 0 }, { scaleY: 1, duration: 0.14 }, 0.1)
        .fromTo(nodes, { x: d * 0.6 }, { x: 0, stagger: 0.012, duration: 0.12 }, 0.14)
        // Desensamblaje (0.8 – 1)
        .to(product, { x: -d * 0.6, duration: 0.2 }, 0.8)
        .to(menu, { x: d * 0.45, duration: 0.2 }, 0.8)
        .to(head, { y: -24, duration: 0.2 }, 0.8);
    }, section);
    return () => ctx.revert();
  }, []);

  const select = (index: number) => {
    const selected = stages[index];
    if (!selected) return;
    setActive(index);
    setManual(true);
    track("flow_stage_select", { stage: selected.label, section_id: "plataforma" });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (index + 1) % total;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (index - 1 + total) % total;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = total - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(index);
      return;
    }
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  if (!stage) return null;

  return (
    <section
      id="plataforma"
      aria-labelledby="plataforma-title"
      ref={sectionRef}
      className="section-shell surface-deep bgseq-host zx-flow"
      onMouseLeave={() => {
        setHovering(false);
        setManual(false);
      }}
    >
      <CinematicBackgroundSequence clips={FLOW_CLIPS} />
      {flowStill ? <SceneStill scene={flowStill} className="scene-still-overlay" /> : null}
      <DigitalTraceOverlay />
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div ref={headRef} className="zx-flow-head">
          <h2 id="plataforma-title" className="section-title-dark">{HEAD.title}</h2>
          <p className="section-lead-dark mt-4 font-semibold !text-skybrand">{HEAD.body}</p>
        </div>

        {FORWARDERS_V2 ? <FlowTransform /> : null}

        <div className="zx-flow-layout mt-10">
          <div className="zx-flow-media" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            <div ref={frameRef} className="zx-flow-frame">
              <figure ref={productRef} className="zx-flow-product">
                <div className="zx-flow-bar">
                  <span>Logixtic® · {stage.label}</span>
                  <span>{active + 1} / {total}</span>
                </div>
                <div className="zx-flow-stage" id="flow-panel" role="tabpanel" aria-live="polite" aria-label={stage.label}>
                  {stages.map((s, i) =>
                    s.image ? (
                      <img
                        key={`stage-${i}`}
                        src={s.image}
                        alt={i === active ? (s.alt ?? "") : ""}
                        aria-hidden={i !== active}
                        loading="lazy"
                        decoding="async"
                        className="zx-flow-layer"
                        data-on={i === active}
                      />
                    ) : (
                      <div
                        key={`portal-${i}`}
                        className="zx-flow-layer zx-flow-portal"
                        data-on={i === active}
                        aria-hidden={i !== active}
                      >
                        <div className="flex flex-col justify-center gap-2 p-3 sm:gap-4 md:p-8">
                          <h3 className="font-display text-sm font-semibold text-on-dark sm:text-lg md:text-2xl">{portal.title}</h3>
                          <p className="hidden max-w-2xl font-ui text-xs leading-relaxed text-on-dark/75 sm:block md:text-sm">{portal.body}</p>
                          <ol className="flex flex-nowrap items-center gap-1 sm:gap-2">
                            {portal.diagram.map((node, n) => (
                              <li key={node} className="flex min-w-0 items-center gap-1 sm:gap-2">
                                <span className="diagram-node !gap-1 !px-2 !py-1 text-[10px] sm:!px-3 sm:!py-2 sm:text-xs">
                                  {n === 1 ? <Building2 className="h-4 w-4 text-amber" aria-hidden="true" /> : <Users className="h-4 w-4 text-skybrand" aria-hidden="true" />}
                                  {node}
                                </span>
                                {n < portal.diagram.length - 1 && <ArrowRight className="h-3 w-3 shrink-0 text-on-dark/40" aria-hidden="true" />}
                              </li>
                            ))}
                          </ol>
                          <ul className="grid grid-cols-2 gap-x-2 gap-y-0 sm:gap-2">
                            {portal.benefits.map((b, n) => {
                              const Icon = portalIcons[n] ?? FileText;
                              return (
                                <li key={b} className="portal-proof-item !py-1 text-[10px] sm:!py-2 sm:text-xs md:text-sm">
                                  <Icon aria-hidden="true" />
                                  <span>{b}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </figure>
            </div>
          </div>

          <div ref={menuRef} className="zx-flow-menu" role="tablist" aria-orientation="vertical" aria-label={HEAD.stagesLabel}>
            <span ref={trackRef} className="zx-flow-track" aria-hidden="true">
              <span className="zx-flow-fill" style={{ transform: `scaleY(${fraction})` }} />
            </span>
            {stages.map((item, index) => {
              const state = index < active ? "done" : index === active ? "current" : "pending";
              return (
                <button
                  key={item.label}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={active === index}
                  aria-controls="flow-panel"
                  tabIndex={active === index ? 0 : -1}
                  onClick={() => select(index)}
                  onKeyDown={(e) => onKey(e, index)}
                  className="focus-ring zx-flow-stage-btn"
                  data-state={state}
                  data-on={active === index}
                >
                  <span className="zx-flow-node" aria-hidden="true" />
                  <span className="zx-flow-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="zx-flow-label">{item.label}</span>
                  {active === index ? <span className="zx-flow-body">{item.body}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="zx-flow-cta">
          <DemoButton sectionId="plataforma" size="lg" />
        </div>
      </div>
    </section>
  );
}
