import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEventHandler, type RefObject } from "react";
import {
  Bot,
  CalendarDays,
  Clock,
  CreditCard,
  MapPin,
  ShieldCheck,
  Tag,
  FileText,
  FolderOpen,
  Link2,
  ListChecks,
  PieChart,
  Ship,
  TrendingDown,
  UserCheck,
  Users,
} from "lucide-react";
import { WHATSAPP_URL } from "@/lib/whatsapp";
import { SuccessStories } from "@/components/site/SuccessStories";
import { OperationalChallenges } from "@/components/site/OperationalChallenges";
import { ZenoxFlow } from "./ZenoxFlow";
import { Implementation as SiteImplementation } from "@/components/site/Implementation";
import { Plans as SitePlans } from "@/components/site/Plans";
import { Faq as SiteFaq } from "@/components/site/Faq";
import { GeoCinematic } from "./GeoCinematic";
import { useToggleReveal } from "./use-toggle-reveal";
import { ZenoxTablet } from "./ZenoxTablet";
import { ZenoxOrbs } from "./ZenoxOrbs";
import { useVisibility } from "./use-visibility";
import { TestimonialStage } from "@/components/experience/TestimonialStage";
import swift from "@/assets/client-logos/swift-cargo.png.asset.json";
import clm from "@/assets/client-logos/clm-cargo.png.asset.json";
import transmares from "@/assets/client-logos/transmares-usa.png.asset.json";
import scit from "@/assets/client-logos/sc-itrading.png.asset.json";
import logsol from "@/assets/client-logos/logistics-solutions.png.asset.json";
import trade from "@/assets/client-logos/trade-business-sas.png.asset.json";
import transint from "@/assets/client-logos/transinternational-cargo.png.asset.json";
import rr from "@/assets/client-logos/rr-logistics.png.asset.json";
import connecta from "@/assets/client-logos/connecta-global-logistics.png.asset.json";
import bsp from "@/assets/client-logos/grupo-bsp.png.asset.json";
import navis from "@/assets/client-logos/navis.png.asset.json";
import globalFreight from "@/assets/client-logos/global-freight.png.asset.json";
import { track } from "@/lib/analytics";
import {
  ZX_CASES,
  ZX_CLOSING,
  ZX_HERO_BLOCK,
  ZX_COMPLIANCE,
  ZX_COVERAGE,
  ZX_ENTITY,
  ZX_FAQ,
  ZX_HERO,
  ZX_IMPLEMENTATION,
  ZX_LOGIX,
  ZX_PLANS,
  ZX_PLATFORM,
  ZX_PROBLEM,
  ZX_RESULTS,
  ZX_SOCIAL,
  ZX_SYSTEM,
  ZX_TRANSITION,
  ZX_UI,
} from "./zenox-copy";
import { openLogixWidget, useDemoUrl } from "./zenox-actions";
import { ZenoxCases } from "./ZenoxCases";
import "./zenox.css";
import "./zenox-v2.css";
import "./zenox-original-art.css";
import "./zenox-lower.css";
import "./zenox-system.css";
import "./zenox-logix-bg.css";
import "./zenox-compliance.css";
import "./zenox-problem.css";

const PLATFORM_ICONS = [Users, FileText, Link2, Ship, FolderOpen, ListChecks, PieChart, UserCheck];
const PROBLEM_ICONS = [TrendingDown, PieChart, Clock];

/* Pausa las animaciones de la ilustración cuando no está en pantalla (data-active). */
function useInViewFlag<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) setActive(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, active: active ? "true" : "false" } as const;
}

function Label({ n, children }: { n?: string; children: string }) {
  return (
    <span className="zx-label">
      {n ? <b>{n}</b> : null}
      {children}
    </span>
  );
}

function Btn({
  href,
  children,
  onClick,
  ghost,
}: {
  href: string;
  children: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  ghost?: boolean;
}) {
  return (
    <a className={`zx-btn${ghost ? " zx-btn--ghost" : ""}`} href={href} onClick={onClick}>
      {children}
      <span className="zx-btn-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}

const chip: CSSProperties = { border: "1px solid var(--zx-line)", borderRadius: 999, padding: "8px 14px" };

/* 01 — Hero: copy a la izquierda, ilustración en capas a la derecha. */
function Hero() {
  const demo = useDemoUrl();
  const stage = useInViewFlag<HTMLDivElement>();
  return (
    <section id="inicio" className="zx-hero-v2 zx-hero-fw" aria-labelledby="zx-hero-title">
      {/* Cinta luminosa del kit Zenox (public/zenox-kit/decor). Sustituye a linea.jpg, cuya licencia está pendiente. */}
      <img className="zx-hero-art" src="/zenox-kit/decor/cinta-neon-principal.webp" alt="" aria-hidden="true" width={1529} height={860} decoding="async" />
      <div className="zx-wrap zx-hero-grid">
        <aside className="zx-hero-block" aria-label={ZX_HERO_BLOCK.tag}>
            <p className="zx-hero-block-tag">{ZX_HERO_BLOCK.tag}</p>
            <p className="zx-hero-block-title">{ZX_HERO_BLOCK.title}</p>
            <ul className="zx-hero-block-list">
              {ZX_HERO_BLOCK.pillars.map((pl) => (
                <li key={pl.h}>
                  <h3 className="zx-hero-block-h">{pl.h}</h3>
                  <p className="zx-hero-block-p">{pl.p}</p>
                </li>
              ))}
            </ul>
        </aside>
        <div className="zx-hero-copy">
          <Label>{ZX_HERO.eyebrow}</Label>
          <h1 id="zx-hero-title" className="zx-h1">
            {ZX_HERO.h1}
          </h1>
          <p className="zx-p zx-p--lead">{ZX_HERO.sub}</p>
          <p className="zx-support">{ZX_HERO.support}</p>
          <div className="zx-cta-row">
            <Btn href={demo} onClick={() => track("zenox_cta_click", { section_id: "hero", cta: "agenda_diagnostico" })}>
              {ZX_HERO.ctaPrimary}
            </Btn>
            <Btn href="#diagnostico-roi" ghost onClick={(e) => openLogixWidget(e, "hero")}>
              {ZX_HERO.ctaSecondary}
            </Btn>
          </div>
          <p className="zx-micro">{ZX_HERO.micro}</p>
        </div>

        <HeroShowcase stageRef={stage.ref} active={stage.active} />
      </div>
    </section>
  );
}

/* Hero · demostración de producto: tres capturas reales (comercial, documental y de margen) en un marco de aplicación.
   La captura se muestra completa (sin recortes). Selector por clic, teclado o toque; avance automático mientras el hero está en pantalla y hasta la primera interacción. */
const SHOWCASE = [
  { src: "/assets/02-gestion-comercial-resumen.webp", w: 1728, h: 910, label: ZX_UI.glassQuote, alt: "Resumen comercial de un prospecto en Logixtic: cotizaciones y actividad" },
  { src: "/assets/08-gestion-documental.webp", w: 1795, h: 876, label: ZX_UI.glassDocs, alt: "Gestión documental de una operación en Logixtic" },
  { src: "/assets/07-rentabilidad-margen.webp", w: 1600, h: 732, label: ZX_UI.glassMargin, alt: "Margen por operación con costos y rentabilidad en Logixtic" },
] as const;

function HeroShowcase({ stageRef, active }: { stageRef: RefObject<HTMLDivElement | null>; active: string }) {
  const [state, setState] = useState(0);
  const [manual, setManual] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (i: number) => {
    setState(i);
    setManual(true);
  };

  useEffect(() => {
    if (manual || active !== "true") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setState((v) => (v + 1) % SHOWCASE.length), 6000);
    return () => window.clearInterval(id);
  }, [manual, active]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--zx-px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--zx-py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    const onLeave = () => {
      el.style.setProperty("--zx-px", "0");
      el.style.setProperty("--zx-py", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [stageRef]);

  const onKey = (e: ReactKeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % SHOWCASE.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + SHOWCASE.length) % SHOWCASE.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = SHOWCASE.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  };

  const current = SHOWCASE[state] ?? SHOWCASE[0];
  return (
    <div ref={stageRef} className="zx-stage zx-showcase" data-active={active} style={{ "--zx-i": state } as CSSProperties}>
      <div className="zx-stage-glow" aria-hidden="true" />
      <div className="zx-showcase-tilt">
        <div className="zx-stage-device zx-frame">
          <div className="zx-frame-bar" aria-hidden="true">
            <span /><span /><span />
            <em>Logixtic · {current.label}</em>
          </div>
          <div className="zx-frame-screen" role="tabpanel" aria-live="polite" aria-label={current.label} style={{ aspectRatio: `${current.w} / ${current.h}` }}>
            {SHOWCASE.map((sc, i) => (
              <img
                key={sc.src}
                className="zx-frame-layer"
                data-on={i === state ? "true" : "false"}
                src={sc.src}
                alt={i === state ? sc.alt : ""}
                width={sc.w}
                height={sc.h}
                decoding="async"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="zx-showcase-tabs" role="tablist" aria-label="Vistas de Logixtic">
        <span className="zx-showcase-rail" aria-hidden="true"><span className="zx-showcase-dot" /></span>
        {SHOWCASE.map((sc, i) => (
          <button
            key={sc.src}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={i === state}
            tabIndex={i === state ? 0 : -1}
            className="zx-showcase-tab focus-ring"
            data-on={i === state ? "true" : "false"}
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span className="zx-dot zx-dot--blue" aria-hidden="true" />
            {sc.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Definición de entidad: texto HTML visible, debajo del hero. */
function Entity() {
  return (
    <section aria-labelledby="zx-entity-title" className="zx-entity">
      <div className="zx-wrap">
        <p id="zx-entity-title" className="zx-entity-text" data-reveal>
          <Label>{ZX_ENTITY.label}</Label>
          <span className="zx-entity-body">{ZX_ENTITY.text}</span>
        </p>
      </div>
    </section>
  );
}

/* El problema: fondo de malla digital y red de conexiones (capas aisladas en .zx-pb), tres tarjetas con composición asimétrica. */
// Nodos y conexiones de la red (viewBox 1200×700). Cada nodo se une con sus dos vecinos más cercanos.
const PB_NODES: ReadonlyArray<readonly [number, number]> = [
  [90, 120], [260, 60], [420, 170], [600, 80], [780, 150], [960, 60], [1120, 170],
  [170, 330], [360, 360], [540, 290], [720, 380], [900, 300], [1080, 400],
  [80, 560], [300, 600], [500, 520], [680, 610], [880, 540], [1100, 620],
];
const PB_EDGES: ReadonlyArray<readonly [number, number]> = (() => {
  const set = new Map<string, [number, number]>();
  PB_NODES.forEach(([x, y], i) => {
    PB_NODES.map(([nx, ny], j) => ({ j, d: Math.hypot(nx - x, ny - y) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach((o) => {
        const key = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`;
        set.set(key, [i, o.j]);
      });
  });
  return Array.from(set.values());
})();

function ProblemNetwork() {
  return (
    <svg className="zx-pb-net" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {PB_EDGES.map(([a, b], k) => {
        const [x1, y1] = PB_NODES[a]!;
        const [x2, y2] = PB_NODES[b]!;
        return <line key={`l${k}`} className="zx-pb-line" x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      {PB_EDGES.filter((_, k) => k % 3 === 0).map(([a, b], k) => {
        const [x1, y1] = PB_NODES[a]!;
        const [x2, y2] = PB_NODES[b]!;
        return (
          <line
            key={`p${k}`}
            className="zx-pb-pulse"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            style={{ "--d": `${k * -1.3}s` } as CSSProperties}
          />
        );
      })}
      {PB_NODES.map(([x, y], i) => (
        <circle key={`n${i}`} className="zx-pb-node" cx={x} cy={y} r={i % 4 === 0 ? 3.2 : 2} />
      ))}
    </svg>
  );
}

function Problem() {
  const ref = useToggleReveal<HTMLElement>();
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (el.getAttribute("data-visible") !== "true") return;
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      el.style.setProperty("--zx-pb-p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return (
    <section ref={ref} className="zx-pb" data-visible="true" aria-labelledby="zx-problem-title">
      <div className="zx-pb-base" aria-hidden="true" />
      <div className="zx-pb-mesh" aria-hidden="true">
        <div className="zx-pb-mesh-drift" />
      </div>
      <ProblemNetwork />
      <div className="zx-wrap zx-pb-content">
        <div data-reveal>
          <Label n="01 /">{ZX_UI.problem}</Label>
          <h2 id="zx-problem-title" className="zx-h2 zx-mt-16" style={{ maxWidth: "24ch" }}>
            {ZX_PROBLEM.h2}
          </h2>
        </div>
        <div className="zx-problem-grid">
          {ZX_PROBLEM.items.map((item, i) => {
            const Icon = PROBLEM_ICONS[i] ?? TrendingDown;
            return (
              <article
                key={item.h3}
                className={`zx-card zx-problem-card zx-problem-card--${i} zx-pb-card`}
                data-reveal
                style={{ "--i": i } as CSSProperties}
              >
                <span className="zx-icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.6} />
                </span>
                <h3 className="zx-h3">{item.h3}</h3>
                <p className="zx-p zx-p--sm">{item.p}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* De la fragmentación al control: 01 Información dispersa → 02 Conexión → 03 Control. */
function Fragmentation() {
  return (
    <section aria-labelledby="zx-transition-title">
      <div className="zx-wrap zx-split">
        <div data-reveal>
          <Label>{ZX_UI.fragmentation}</Label>
          <h2 id="zx-transition-title" className="zx-h2 zx-mt-16">
            {ZX_TRANSITION.h2}
          </h2>
          <p className="zx-p zx-mt-16">{ZX_TRANSITION.p}</p>
        </div>
        <div className="zx-flow" data-reveal>
          <div className="zx-flow-track" aria-hidden="true">
            <span />
          </div>
          <ol className="zx-flow-steps">
            {ZX_TRANSITION.steps.map((s, i) => (
              <li key={s.h3}>
                <span className="zx-flow-num">0{i + 1}</span>
                <div>
                  <h3 className="zx-h3">{s.h3}</h3>
                  <p className="zx-p zx-p--sm">{s.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* Plataforma (Framer "The Platform"): tres estados con escena fija; el estado activo sigue al scroll. */
/* Recortes verticales (≈0,586) de las capturas auténticas de Logixtic para la pantalla del teléfono. */
// Tablet con manos (kit Zenox): una captura auténtica de Logixtic por estado de The Platform.
const PLATFORM_SCREENS = [
  { src: "/zenox-kit/screens/documentos.webp", alt: "Documentos vinculados a una operación en Logixtic" },
  { src: "/zenox-kit/screens/operacion.webp", alt: "Pasos de una operación con seguimiento en Logixtic" },
  { src: "/zenox-kit/screens/rentabilidad.webp", alt: "Margen y rentabilidad por operación en Logixtic" },
] as const;
const PLATFORM_STATES_H2 = "De Excel, correos y WhatsApp a una sola fuente de información";
const PLATFORM_STATES = [
  { n: "01", title: "Información dispersa", p: "Hojas de cálculo desactualizadas, documentos sueltos, cotizaciones sin seguimiento, HBL, HAWB y certificados en carpetas distintas." },
  { n: "02", title: "Conexión", p: "Cliente, cotización, operación y documentos quedan vinculados." },
  { n: "03", title: "Control", p: "Trazabilidad, indicadores y margen por operación en un solo lugar." },
] as const;

function Platform() {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      steps.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <section id="software" className="zx-pf" aria-labelledby="zx-platform-title">
      <div className="zx-wrap">
        <div>
          <Label n="02 /">{ZX_PLATFORM.label}</Label>
          <h2 id="zx-platform-title" className="zx-h2 zx-mt-16" style={{ maxWidth: "24ch" }}>
            {PLATFORM_STATES_H2}
          </h2>
        </div>
        <div className="zx-pf-grid">
          <div className="zx-pf-stage">
            <ZenoxTablet states={PLATFORM_SCREENS} active={active} />
          </div>
          <ol className="zx-pf-steps">
            {PLATFORM_STATES.map((s, i) => (
              <li
                key={s.title}
                className="zx-pf-step"
                data-state={i}
                data-current={i === active ? "true" : "false"}
                ref={(el) => {
                  steps.current[i] = el;
                }}
                aria-current={i === active ? "step" : undefined}
              >
                <span className="zx-pf-num">{s.n}</span>
                <h3 className="zx-h3">{s.title}</h3>
                <p className="zx-p zx-p--sm">{s.p}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* Services (Framer "Services"): tres grupos con las ocho capacidades; la tarjeta activa muestra su detalle. */
// Base gráfica del kit Zenox por categoría (tres categorías aprobadas de Services).
const SERVICE_FRAMES = [
  "/zenox-kit/feature-frames/base-gestion-comercial.svg",
  "/zenox-kit/feature-frames/base-gestion-operativa.svg",
  "/zenox-kit/feature-frames/base-rentabilidad.svg",
] as const;

// Una captura real distinta por grupo de servicios (comercial, operativa, control y rentabilidad).
const SERVICE_SHOTS = [
  { src: "/assets/03-gestion-comercial-timeline.webp", alt: "Historial comercial fechado de un prospecto en Logixtic" },
  { src: "/assets/05-seguimiento-operativo-tareas.webp", alt: "Tareas operativas y checklist de una operación en Logixtic" },
  { src: "/assets/06-costos-operacion.webp", alt: "Costos de la operación con margen real por servicio" },
] as const;

const SERVICE_GROUPS = [
  { title: "Gestión comercial", idx: [0, 1, 2] },
  { title: "Gestión operativa", idx: [3, 4, 5] },
  { title: "Control y rentabilidad", idx: [6, 7] },
] as const;

function Services() {
  const [active, setActive] = useState(0);
  const group = SERVICE_GROUPS[active] ?? SERVICE_GROUPS[0];
  const caps = group.idx.map((i) => ZX_PLATFORM.capabilities[i]).filter(Boolean);
  return (
    <section id="servicios" className="zx-sv" aria-labelledby="zx-services-title">
      <ZenoxOrbs />
      <div className="zx-wrap zx-sv-grid">
        <div
          className="zx-sv-card"
          aria-live="polite"
          style={{ backgroundImage: `linear-gradient(rgb(5 6 11 / 0.55), rgb(5 6 11 / 0.72)), url(${SERVICE_FRAMES[active] ?? SERVICE_FRAMES[0]})` }}
        >
          <img
            key={active}
            className="zx-sv-shot zx-sv-enter"
            src={SERVICE_SHOTS[active]?.src ?? SERVICE_SHOTS[0]!.src}
            alt={SERVICE_SHOTS[active]?.alt ?? SERVICE_SHOTS[0]!.alt}
            width={1836}
            height={857}
            decoding="async"
          />
          <span className="zx-sv-num">0{active + 1}</span>
          <h3 className="zx-h3">{group.title}</h3>
          <ul className="zx-sv-caps">
            {caps.map((c) => (
              <li key={c.h3}>
                <strong>{c.h3}.</strong> {c.p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Label n="03 /">Capacidades</Label>
          <h2 id="zx-services-title" className="zx-h2 zx-mt-16" style={{ maxWidth: "26ch" }}>
            {ZX_PLATFORM.h2}
          </h2>
          <ul className="zx-sv-list">
            {SERVICE_GROUPS.map((g, i) => (
              <li key={g.title}>
                <button
                  type="button"
                  className="zx-sv-item"
                  aria-pressed={i === active}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className="zx-sv-item-title">{g.title}</span>
                  <span className="zx-sv-item-num">0{i + 1}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* Sistema Operativo: definición, conexiones animadas y ficha rápida (glass dashboard). Contenido de ZX_SYSTEM. */
const OS_ICONS = [Tag, Users, Link2, Bot, ShieldCheck, ListChecks, CreditCard, MapPin, CalendarDays] as const;

function OsConnections() {
  return (
    <svg className="zx-os-net" viewBox="0 0 520 170" role="presentation" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="zx-os-flow-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3ec7ff" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#8b6bff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#3ec7ff" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path className="zx-os-track" d="M70 70 C150 10 190 10 260 70" />
      <path className="zx-os-track" d="M260 70 C330 130 380 130 450 70" />
      <path className="zx-os-flow" d="M70 70 C150 10 190 10 260 70" />
      <path className="zx-os-flow zx-os-flow--b" d="M260 70 C330 130 380 130 450 70" />
      <g className="zx-os-node" transform="translate(70 70)"><circle r="16" /><circle className="zx-os-core" r="5" /></g>
      <g className="zx-os-node" transform="translate(260 70)"><circle r="16" /><circle className="zx-os-core" r="5" /></g>
      <g className="zx-os-node" transform="translate(450 70)"><circle r="16" /><circle className="zx-os-core" r="5" /></g>
      <text x="70" y="118" textAnchor="middle">Gestión comercial</text>
      <text x="260" y="118" textAnchor="middle">Operación</text>
      <text x="450" y="118" textAnchor="middle">Finanzas</text>
    </svg>
  );
}

function SystemDefinition() {
  const ref = useToggleReveal<HTMLElement>();
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (el.getAttribute("data-visible") !== "true") return;
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      el.style.setProperty("--zx-os-p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return (
    <section ref={ref} className="zx-os" data-visible="true" aria-labelledby="zx-system-title">
      <div className="zx-os-bg" aria-hidden="true">
        <div className="zx-os-drift" />
      </div>
      <div className="zx-wrap zx-os-grid">
        <div className="zx-os-copy">
          <h2 id="zx-system-title" className="zx-h2 zx-os-title">
            {ZX_SYSTEM.h2}
          </h2>
          <p className="zx-p zx-mt-16 zx-os-text">{ZX_SYSTEM.p}</p>
          <OsConnections />
        </div>
        <div className="zx-os-panel">
          <p className="zx-os-caption">Ficha rápida</p>
          <dl className="zx-os-rows">
            {ZX_SYSTEM.card.map(([k, v], i) => {
              const Icon = OS_ICONS[i] ?? Tag;
              return (
                <div className="zx-os-row" key={k} style={{ "--i": i } as CSSProperties}>
                  <dt>
                    <Icon size={16} strokeWidth={1.75} aria-hidden="true" focusable="false" />
                    {k}
                  </dt>
                  <dd>{v}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* Resultados: indicadores conceptuales, sin cifras no validadas. */
function Results() {
  return (
    <section aria-labelledby="zx-results-title">
      <div className="zx-wrap">
        <div data-reveal>
          <Label n="03 /">Indicadores</Label>
          <h2 id="zx-results-title" className="zx-h2 zx-mt-16" style={{ maxWidth: "26ch" }}>
            {ZX_RESULTS.h2}
          </h2>
          <p className="zx-p zx-mt-16">{ZX_RESULTS.p}</p>
        </div>
        <div className="zx-insights">
          {ZX_RESULTS.indicators.map((i, idx) => (
            <article key={i.label} className="zx-card zx-insight" data-reveal>
              <span className="zx-insight-index">0{idx + 1}</span>
              <h3 className="zx-h3">{i.label}</h3>
              <p className="zx-p zx-p--sm">{i.note}</p>
            </article>
          ))}
        </div>
        <p className="zx-pending zx-mt-16">{ZX_RESULTS.disclaimer}</p>
      </div>
    </section>
  );
}

/* Clientes: prueba social y caso de éxito preparados, sin testimonios ni logos sin autorización. */
/* Casos de éxito: video autorizado ya publicado en el sitio (mismo ID que SuccessStories) y logos existentes. */
const CASE_VIDEO_ID = "V39UQwu2THo";
const CLIENT_LOGOS = [
  { name: "Swift Cargo", src: swift.url },
  { name: "CLM Cargo", src: clm.url },
  { name: "Transmares USA", src: transmares.url },
  { name: "SC iTrading", src: scit.url },
  { name: "Logistics Solutions", src: logsol.url },
  { name: "Trade & Business SAS", src: trade.url },
  { name: "Transinternational Cargo LTDA", src: transint.url },
  { name: "R&R Logistics", src: rr.url },
  { name: "Connecta Global Logistics", src: connecta.url },
  { name: "Grupo BSP", src: bsp.url },
  { name: "Navis Logistics", src: navis.url },
  { name: "Global Freight SAS", src: globalFreight.url },
];

function Clients() {
  return (
    <section id="clientes" aria-labelledby="zx-social-title">
      <div className="zx-wrap zx-split">
        <div data-reveal>
          <h2 id="zx-social-title" className="zx-h2">
            {ZX_SOCIAL.h2}
          </h2>
          <p className="zx-p zx-mt-16">{ZX_SOCIAL.p}</p>
          <p className="zx-pending zx-mt-16">{ZX_SOCIAL.pending}</p>
        </div>
        <div data-reveal>
          <ul className="zx-logos" aria-label="Clientes que usan Logixtic">
            {CLIENT_LOGOS.map((l) => (
              <li key={l.name}>
                <img src={l.src} alt={l.name} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
          <article className="zx-card zx-case" aria-labelledby="zx-case-title">
            <h3 id="zx-case-title" className="zx-h3">
              {ZX_CASES.h2}
            </h3>
            <p className="zx-p zx-p--sm">{ZX_CASES.p}</p>
            <TestimonialStage
              videoId={CASE_VIDEO_ID}
              poster={`https://i.ytimg.com/vi/${CASE_VIDEO_ID}/hqdefault.jpg`}
              posterAlt={ZX_CASES.h2}
              title="Ver historia de cliente"
              aria-label="Ver historia de cliente"
            />
          </article>
        </div>
      </div>
    </section>
  );
}

/* Logix: protagonista con ejemplo ilustrativo. Integra el AgentWidget existente sin duplicarlo. */
/* Logix (Framer "Logix"): robot original a la derecha; filas de capacidades a la izquierda. El widget es el existente. */
const LOGIX_ROBOT = "/__l5e/assets-v1/b05fdbf7-58c4-4f42-b563-2faf808eedcd/logix-transparent.png";
const LOGIX_ROWS = ZX_LOGIX.copilots;
// Partículas lentas del fondo de Logix: posición (%), posición (%) y retardo de la animación.
const LX_DOTS: ReadonlyArray<readonly [number, number, number]> = [
  [8, 14, 0], [22, 62, 1.3], [41, 9, 2.1], [57, 78, 0.6], [88, 18, 3.2], [94, 58, 1.8], [12, 88, 2.7],
  [33, 40, 4.1], [70, 92, 0.9], [78, 30, 2.4], [48, 52, 3.6], [96, 84, 1.1],
];

function Logix() {
  const lxRef = useVisibility<HTMLElement>();
  // Parallax suave del fondo de Logix (variable CSS --lx-p, solo transform). Con movimiento reducido no se aplica.
  useEffect(() => {
    const el = lxRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      el.style.setProperty("--lx-p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lxRef]);
  return (
    <section ref={lxRef} id="logix" aria-labelledby="zx-logix-title" className="zx-lx" data-active="false">
      <div className="zx-lx-bg" aria-hidden="true">
        <div className="zx-lx-base" />
        <div className="zx-lx-par">
          <div className="zx-lx-drift">
            <div className="zx-lx-img" />
          </div>
        </div>
        <span className="zx-lx-glow" />
        {LX_DOTS.map((d, i) => (
          <span key={i} className="zx-lx-dot" style={{ "--x": `${d[0]}%`, "--y": `${d[1]}%`, "--d": `${d[2]}s` } as CSSProperties} />
        ))}
      </div>
      <div className="zx-wrap zx-lx-grid">
        <div className="zx-lx-copy" id="diagnostico-roi" data-reveal>
          <Label n="04 /">Logix (IA)</Label>
          <h2 id="zx-logix-title" className="zx-h2 zx-mt-16">
            {ZX_LOGIX.h2}
          </h2>
          <p className="zx-p zx-mt-16">{ZX_LOGIX.p}</p>
          <ul className="zx-lx-rows">
            {LOGIX_ROWS.map((r) => (
              <li key={r.h3}>
                <h3 className="zx-h3">{r.h3}</h3>
                <p className="zx-p zx-p--sm">{r.p}</p>
              </li>
            ))}
          </ul>
          <div className="zx-chat-foot">
            <Btn href="#diagnostico-roi" ghost onClick={(e) => openLogixWidget(e, "logix")}>
              {ZX_LOGIX.buttonLabel}
            </Btn>
          </div>
        </div>
        <figure className="zx-lx-visual" data-reveal>
          <span className="zx-lx-halo" aria-hidden="true" />
          <img className="zx-lx-float" src={LOGIX_ROBOT} alt="Logix, asistente de Logixtic" width={530} height={530} loading="lazy" decoding="async" />
        </figure>
      </div>
    </section>
  );
}

/* Implementación: línea de seis etapas con progreso (transform, sin dependencias). */
function Implementation() {
  return (
    <section id="implementacion" aria-labelledby="zx-impl-title">
      <div className="zx-wrap">
        <div data-reveal>
          <Label n="05 /">Implementación</Label>
          <h2 id="zx-impl-title" className="zx-h2 zx-mt-16" style={{ maxWidth: "30ch" }}>
            {ZX_IMPLEMENTATION.h2}
          </h2>
        </div>
        <div className="zx-timeline" data-reveal>
          <div className="zx-timeline-track" aria-hidden="true">
            <span />
          </div>
          <ol>
            {ZX_IMPLEMENTATION.stages.map((s, i) => (
              <li key={s}>
                <span className="zx-timeline-dot">0{i + 1}</span>
                <h3 className="zx-h3">{s}</h3>
              </li>
            ))}
          </ol>
        </div>
        <p className="zx-p zx-mt-16">{ZX_IMPLEMENTATION.note}</p>
      </div>
    </section>
  );
}

/* Planes: cuatro tarjetas (Standard, Enterprise, Custom y Setup Fee), sin precios no aprobados. */
function Plans() {
  const demo = useDemoUrl();
  return (
    <section id="planes" aria-labelledby="zx-plans-title">
      <div className="zx-wrap">
        <div data-reveal>
          <Label n="06 /">Planes</Label>
          <h2 id="zx-plans-title" className="zx-h2 zx-mt-16">
            {ZX_PLANS.h2}
          </h2>
          <p className="zx-p zx-mt-16">{ZX_PLANS.p}</p>
        </div>
        <div className="zx-plans">
          {ZX_PLANS.tiers.map((t) => (
            <article className="zx-price" key={t.id} data-reveal>
              <h3 className="zx-h3 zx-price-name">{t.name}</h3>
              <p className="zx-p zx-p--sm">{t.for}</p>
              <ul>
                {t.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </article>
          ))}
          <article className="zx-price zx-price--setup" data-reveal>
            <h3 className="zx-h3 zx-price-name">{ZX_PLANS.setup.name}</h3>
            <ul>
              {ZX_PLANS.setup.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </article>
        </div>
        <p className="zx-p zx-mt-16">{ZX_PLANS.priceNote}</p>
        <div className="zx-cta-row zx-mt-16">
          <Btn href={demo} onClick={() => track("zenox_cta_click", { section_id: "planes", cta: "agenda_diagnostico" })}>
            {ZX_CLOSING.cta}
          </Btn>
        </div>
      </div>
    </section>
  );
}

/* Seguridad, cumplimiento y cobertura: referencias normativas, no sellos. */
// Franja de logos de cumplimiento: nueve elementos en dos grupos, todos con la misma ficha.
// Fuentes: public/respaldo (archivos entregados por el propietario) y public/compliance/dian.png.
// El ISO 28000 no usa imagen: se identifica tipográficamente (no imita un sello de certificación).
const LOGO_ECOSYSTEM: ReadonlyArray<{ name: string; src: string; zoom?: number }> = [
  { name: "Cámara de Comercio de Cali", src: "/respaldo/04-camara-comercio-cali.png" },
  { name: "Gobernación del Valle del Cauca · Paraíso de Todos", src: "/respaldo/05-gobernacion-y-paraiso.png", zoom: 1.12 },
  { name: "NIDO", src: "/respaldo/01-nido.png" },
  { name: "Endeavor", src: "/respaldo/02-endeavor.png" },
  { name: "Rockstart", src: "/respaldo/03-rockstart.png" },
];
const LOGO_NORMATIVE: ReadonlyArray<{ name: string; src: string | null; tone: "light" | "dark"; zoom?: number }> = [
  { name: "OEA · Operador Económico Autorizado (Colombia)", src: "/respaldo/Logo-OEA.jpg", tone: "light", zoom: 1.45 },
  { name: "BASC · Business Alliance for Secure Commerce", src: "/respaldo/images.jpg", tone: "light", zoom: 1.2 },
  { name: "ISO 28000 · Seguridad de la cadena de suministro", src: "/respaldo/images%20(1).jpg", tone: "dark" },
  { name: "DIAN · Dirección de Impuestos y Aduanas Nacionales", src: "/compliance/dian.png", tone: "light" },
];

function Compliance() {
  const cardRef = useToggleReveal<HTMLDivElement>();
  return (
    <section aria-labelledby="zx-compliance-title" className="zx-cmp">
      <div className="zx-cmp-bg" aria-hidden="true" />
      <div className="zx-wrap zx-split">
        <div data-reveal>
          <Label n="07 /">Cumplimiento</Label>
          <h2 id="zx-compliance-title" className="zx-h2 zx-mt-16">
            {ZX_COMPLIANCE.h2}
          </h2>
          <p className="zx-p zx-mt-16">{ZX_COMPLIANCE.p}</p>
        </div>
        <div ref={cardRef} className="zx-card zx-card--glass zx-tr" data-visible="true">
          <div className="zx-logo-group">
            <p className="zx-logo-group-title">Normativa y comercio exterior</p>
            <ul className="zx-seals zx-seals--norm" aria-label="Normativa y comercio exterior">
              {LOGO_NORMATIVE.map((l) =>
                l.src ? (
                  <li key={l.name} className={`zx-seal ${l.tone === "light" ? "zx-seal--light" : "zx-seal--dark"}`} style={{ "--zoom": l.zoom ?? 1 } as CSSProperties}>
                    <img src={l.src} alt={l.name} width={600} height={300} loading="lazy" decoding="async" />
                  </li>
                ) : (
                  <li key={l.name} className="zx-seal zx-seal--iso" aria-label={l.name}>
                    <span className="zx-seal-iso-name">ISO 28000</span>
                    <span className="zx-seal-iso-note">Norma de referencia</span>
                  </li>
                ),
              )}
            </ul>
          </div>
          <p className="zx-logo-note">{ZX_COMPLIANCE.disclaimer}</p>
          <h3 className="zx-h3 zx-mt-16">{ZX_COVERAGE.h2}</h3>
          <p className="zx-p zx-p--sm">{ZX_COVERAGE.p}</p>
        </div>
      </div>
      <div className="zx-ticker" aria-label="Ecosistema e instituciones">
        <p className="zx-ticker-title">Ecosistema e instituciones</p>
        <div className="zx-ticker-viewport">
          <div className="zx-ticker-track">
            {[0, 1, 2, 3].map((k) => (
              <ul key={k} className="zx-ticker-set" aria-hidden={k > 0 ? "true" : undefined}>
                {LOGO_ECOSYSTEM.map((l) => (
                  <li key={`${k}-${l.name}`} className="zx-ticker-item">
                    <img src={l.src} alt={k === 0 ? l.name : ""} loading="lazy" decoding="async" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* FAQ: acordeón con <details>; todo el texto está en el HTML del servidor. */
function Faq() {
  return (
    <section aria-label={ZX_UI.faq}>
      <div className="zx-wrap zx-split">
        <div data-reveal>
          <Label n="08 /">{ZX_UI.faq}</Label>
        </div>
        <div className="zx-faq" data-reveal>
          {ZX_FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p className="zx-p zx-p--sm">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Cierre con composición de gran escala y CTA destacado. */
function Closing() {
  const demo = useDemoUrl();
  return (
    <section aria-labelledby="zx-closing-title" className="zx-closing-section">
      <div className="zx-ribbon zx-ribbon--closing" aria-hidden="true" />
      <div className="zx-wrap zx-closing" data-reveal>
        <Label>{ZX_CLOSING.label}</Label>
        <h2 id="zx-closing-title" className="zx-h1">
          {ZX_CLOSING.h2}
        </h2>
        <p className="zx-p">{ZX_CLOSING.p}</p>
        <div className="zx-cta-row">
          <Btn href={demo} onClick={() => track("zenox_cta_click", { section_id: "closing", cta: "agenda_diagnostico" })}>
            {ZX_CLOSING.cta}
          </Btn>
          <a className="zx-btn zx-btn--ghost" href={WHATSAPP_URL} rel="noopener">
            {ZX_UI.whatsapp}
          </a>
        </div>
      </div>
    </section>
  );
}

/* Home Zenox: orden narrativo unificado. Contenido real de Logixtic en los componentes existentes. */
export function ZenoxHome() {
  return (
    <div className="zx-root" id="zenox-home">
      <Hero />
      <ZenoxCases />
      <Platform />
      <Services />
      <SystemDefinition />
      <Problem />
      <OperationalChallenges variant="zenox" />
      <ZenoxFlow />
      <GeoCinematic />
      <SuccessStories variant="zenox" />
      <Logix />
      <SiteImplementation variant="zenox" />
      <SitePlans />
      <Compliance />
      <SiteFaq variant="zenox" />
      <Closing />
    </div>
  );
}

