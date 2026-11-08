import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ClipboardList, GraduationCap, Rocket, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { CinematicBackgroundSequence } from "@/components/experience/CinematicBackgroundSequence";
import { CINEMATIC_CLIPS } from "@/lib/cinematic-media";
import { FORWARDERS_V2 } from "@/lib/cinematic-assets";
import { SCENE_SECTIONS, videoClipsFor } from "@/lib/visual-scenes";
import "./implementation-zenox.css";

// V2: puesta en marcha con puerto de fondo, sin personas (personal.mp4 fuera de V2 hasta aprobación).
const IMPLEMENTATION_CLIPS = [CINEMATIC_CLIPS.workers];

const stepIcons = [ClipboardList, SlidersHorizontal, GraduationCap, ShieldCheck, Rocket, UsersRound];
// Partículas de flujo de información: posición horizontal (%), retardo (s) y duración (s).
const IM2_FLOW: ReadonlyArray<readonly [number, number, number]> = [
  [6, 0, 14], [18, 3, 18], [31, 7, 16], [44, 1.5, 20], [57, 9, 15], [69, 4.5, 19], [82, 2, 17], [93, 6.5, 21],
];
const INTERVAL = 5000;

const copy = {
  es: {
    kicker: "Implementación y acompañamiento",
    title: ["Tu operación conectada.", "Tu equipo acompañado."],
    body: "Desde la configuración hasta la operación real, avanzamos contigo.",
    stage: "Etapa",
    note: "La duración depende del alcance de cada operación.",
    list: "Etapas de implementación",
    steps: [
      ["Levantamiento", "Conocemos tu operación y tu forma de trabajar."],
      ["Parametrización", "Configuramos el sistema según tu operación."],
      ["Capacitación", "Entrenamos a tu equipo en el uso de la plataforma."],
      ["Pruebas", "Validamos el proceso completo antes de la salida."],
      ["Salida", "Ponemos el sistema en marcha con tu equipo."],
      ["Acompañamiento", "Seguimos contigo después de la puesta en marcha."],
    ],
  },
  en: {
    kicker: "Implementation and support",
    title: ["Your operation, connected.", "Your team, supported."],
    body: "From setup to real-world operation, we move forward with you.",
    stage: "Stage",
    note: "Timing depends on the scope of each operation.",
    list: "Implementation stages",
    steps: [
      ["Discovery", "We learn about your operation and how you work."],
      ["Configuration", "We configure the system for your operation."],
      ["Training", "We train your team to use the platform."],
      ["Testing", "We validate the complete process before launch."],
      ["Launch", "We put the system into operation with your team."],
      ["Ongoing support", "We stay with you after go-live."],
    ],
  },
  pt: {
    kicker: "Implementação e acompanhamento",
    title: ["Sua operação conectada.", "Sua equipe acompanhada."],
    body: "Da configuração à operação real, avançamos com você.",
    stage: "Etapa",
    note: "A duração depende do escopo de cada operação.",
    list: "Etapas de implementação",
    steps: [
      ["Levantamento", "Conhecemos sua operação e sua forma de trabalhar."],
      ["Parametrização", "Configuramos o sistema de acordo com sua operação."],
      ["Capacitação", "Treinamos sua equipe no uso da plataforma."],
      ["Testes", "Validamos o processo completo antes da entrada em operação."],
      ["Entrada em operação", "Colocamos o sistema em funcionamento com sua equipe."],
      ["Acompanhamento", "Continuamos com você após a entrada em operação."],
    ],
  },
} as const;

/*
 * variant "legacy" (por defecto): sin cambios (control de regresión).
 * variant "zenox": fondo continuo de toda la sección (fondo2 del kit) en capas aisladas; la cinta azul de
 * #implementacion::before deja de dibujarse. Las seis etapas, tarjetas y timeline no cambian.
 */
export function Implementation({ variant = "legacy" }: { variant?: "legacy" | "zenox" } = {}) {
  const zenox = variant === "zenox";
  const { locale } = useLanguage();
  const t = copy[locale === "pt-BR" ? "pt" : locale === "en" ? "en" : "es"];
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener("change", onMq);
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const node = ref.current;
    let io: IntersectionObserver | undefined;
    if (node && "IntersectionObserver" in window) {
      io = new IntersectionObserver(([e]) => {
        if (!e) return;
        setInView(e.isIntersecting);
       
      }, { threshold: 0.3 });
      io.observe(node);
    }
    return () => { mq.removeEventListener("change", onMq); document.removeEventListener("visibilitychange", onVis); io?.disconnect(); };
  }, []);

  // Parallax suave del fondo (variable CSS --im-p). Con movimiento reducido no se aplica.
  useEffect(() => {
    const el = ref.current;
    if (!zenox || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      el.style.setProperty("--im-p", p.toFixed(3));
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
  }, [zenox]);

  const running = !hovering && inView && tabVisible && !reduced;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % 6), INTERVAL);
    return () => window.clearTimeout(id);
  }, [running, active]);

  const select = useCallback((i: number) => { setActive(i); }, []);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % 6;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i + 5) % 6;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = 5;
    if (n < 0) return;
    e.preventDefault();
    select(n);
    document.getElementById(`im2-step-${n}`)?.focus();
  };

  const ActiveIcon = stepIcons[active] ?? ClipboardList;
  const [activeLabel, activeBody] = t.steps[active] ?? t.steps[0];
  const progress = ((active + 0.5) / 6) * 100;

  return (
    <section
      ref={ref}
      id="implementacion"
      aria-labelledby="implementacion-title"
      data-active={zenox ? (inView ? "true" : "false") : undefined}
      className={zenox ? "section-shell surface-deep im2 im2-zenox" : "section-shell surface-deep im2 bgseq-host"}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false); }}
    >
      {zenox ? (
        <div className="im2-bg" aria-hidden="true">
          <div className="im2-base" />
          <div className="im2-par">
            <div className="im2-drift">
              <div className="im2-img" />
            </div>
          </div>
          <span className="im2-glow im2-glow--a" />
          <span className="im2-glow im2-glow--b" />
          {IM2_FLOW.map((d, i) => (
            <span key={i} className="im2-flow" style={{ "--x": `${d[0]}%`, "--d": `${d[1]}s`, "--t": `${d[2]}s` } as CSSProperties} />
          ))}
        </div>
      ) : (
        <CinematicBackgroundSequence
          clips={FORWARDERS_V2 ? videoClipsFor(SCENE_SECTIONS.implementation) : IMPLEMENTATION_CLIPS}
          stockNotice
        />
      )}
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <header data-reveal className="reveal-item im2-head">
          <p className="section-kicker">{t.kicker}</p>
          <h2 id="implementacion-title" className="section-title-dark mt-3">
            {t.title[0]}<br />{t.title[1]}
          </h2>
          <p className="section-lead-dark mt-4">{t.body}</p>
        </header>

        <div className="im2-grid">
          <div className="im2-panel" aria-live="polite">
            <div className="im2-orb" key={active}>
              <ActiveIcon aria-hidden="true" strokeWidth={1.4} />
            </div>
            <p className="im2-stage">{t.stage} {String(active + 1).padStart(2, "0")}</p>
            <h3 className="title-panel mt-1.5">{activeLabel}</h3>
            <p className="im2-panel-body">{activeBody}</p>
          </div>

          <div className="im2-track">
            <svg className="im2-line" viewBox="0 0 20 600" preserveAspectRatio="none" aria-hidden="true">
              <path className="im2-line-base" d="M10 0 C 2 50, 18 50, 10 100 S 2 150, 10 200 S 18 250, 10 300 S 2 350, 10 400 S 18 450, 10 500 S 2 550, 10 600" pathLength={100} />
              <path className="im2-line-progress" d="M10 0 C 2 50, 18 50, 10 100 S 2 150, 10 200 S 18 250, 10 300 S 2 350, 10 400 S 18 450, 10 500 S 2 550, 10 600" pathLength={100} style={{ strokeDasharray: `${progress} 100` }} />
            </svg>
            <ol role="tablist" aria-label={t.list} aria-orientation="vertical" className="im2-list">
              {t.steps.map(([label, body], i) => {
                const Icon = stepIcons[i] ?? ClipboardList;
                const isActive = i === active;
                return (
                  <li key={i} className="im2-item">
                    <button
                      id={`im2-step-${i}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      data-active={isActive}
                      className="im2-step focus-ring"
                      onClick={() => select(i)}
                      onKeyDown={(e) => onKey(e, i)}
                    >
                      <span className="im2-dot" aria-hidden="true" />
                      <span className="im2-icon"><Icon aria-hidden="true" /></span>
                      <span className="im2-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="im2-text">
                        <span className="im2-label">{label}</span>
                        <span className="im2-body">{body}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="im2-note">{t.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
