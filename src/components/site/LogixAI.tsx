import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowRight, BarChart3, ChevronRight, ClipboardCheck, FileText, MonitorSmartphone, Pause, PieChart, Play,
  Settings, Settings2, UserRound, UserRoundSearch, UsersRound,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import logixAsset from "@/assets/logix-transparent.png.asset.json";

const moduleIcons = [UsersRound, UserRoundSearch, Settings2, FileText, ClipboardCheck, MonitorSmartphone];
const copilotIcons = [BarChart3, FileText, Settings, PieChart];
// Módulos relacionados por copiloto (índices: Clientes, Prospectos, Operaciones, Documentos, DO, Portal)
const related = [[0, 1], [0, 2], [2, 3, 4], [2, 4]];
const STEP_MS = 7000;

type Copilot = { name: string; label: string; query: string; answer: string; items: string[]; actions: string[]; details: string[] };
type Copy = {
  kicker: string; title: string; body: string; choose: string; modules: string[];
  pause: string; resume: string; copilots: Copilot[];
};

const copy: Record<"es" | "en" | "pt-BR", Copy> = {
  es: {
    kicker: "Logix aplicado", title: "Pregúntale a Logix sobre tu operación.",
    body: "Consulta la información de tu operación según los permisos de tu equipo.",
    choose: "Elige tu copiloto",
    modules: ["Clientes", "Prospectos", "Operaciones", "Documentos", "DO", "Portal cliente"],
    pause: "Pausar movimiento", resume: "Reanudar",
    copilots: [
      { name: "Comercial", label: "Consulta comercial", query: "¿Qué actividad tiene el prospecto registrado esta semana?", answer: "Consulto la información comercial disponible según tus permisos.", items: ["Prospecto y empresa", "Responsable asignado", "Actividad registrada", "Historial comercial"], actions: ["Ver prospecto", "Historial", "Cliente"], details: ["Se abriría la ficha del prospecto con su actividad registrada.", "Se mostraría el historial comercial disponible.", "Se mostraría el expediente del cliente asociado."] },
      { name: "Pricing · Rates", label: "Consulta de cotización", query: "¿Qué costos tiene la cotización de esta operación?", answer: "Consulto los costos registrados en la cotización según tus permisos.", items: ["Cotización relacionada", "Costos por servicio", "Cliente asociado", "Operación vinculada"], actions: ["Ver cotización", "Operación", "Cliente"], details: ["Se abriría la cotización con sus costos por servicio.", "Se abriría la operación vinculada a la cotización.", "Se mostraría el expediente del cliente asociado."] },
      { name: "Operativo", label: "Consulta operativa", query: "¿Dónde está el pedido 4587?", answer: "Consulto los registros disponibles según tus permisos.", items: ["Pedido 4587", "Estado de la operación", "Operación relacionada", "Documentos disponibles"], actions: ["Ver operación", "Documentos", "Cliente"], details: ["Se abriría la operación relacionada con su seguimiento por pasos.", "Se mostrarían los documentos asociados que puedes consultar.", "Se mostraría el expediente del cliente con su historial."] },
      { name: "KPI", label: "Consulta de indicadores", query: "¿Cuál es el margen de esta operación?", answer: "Consulto los indicadores registrados en la operación según tus permisos.", items: ["Costos presupuestados", "Costos reales", "Margen presupuestado", "Margen real"], actions: ["Ver indicadores", "Operación", "Costos"], details: ["Se mostrarían los indicadores registrados de la operación.", "Se abriría la operación relacionada.", "Se mostrarían los costos presupuestados y reales."] },
    ],
  },
  en: {
    kicker: "Logix in action", title: "Ask Logix about your operation.",
    body: "Search your operation's information according to your team's permissions.",
    choose: "Choose your copilot",
    modules: ["Customers", "Prospects", "Operations", "Documents", "DO", "Customer portal"],
    pause: "Pause motion", resume: "Resume",
    copilots: [
      { name: "Sales", label: "Sales query", query: "What activity does this week's prospect have?", answer: "I search the available sales information according to your permissions.", items: ["Prospect and company", "Assigned owner", "Recorded activity", "Sales history"], actions: ["View prospect", "History", "Customer"], details: ["The prospect record with its recorded activity would open.", "The available sales history would be shown.", "The associated customer record would be shown."] },
      { name: "Pricing · Rates", label: "Quotation query", query: "What costs does this operation's quotation include?", answer: "I search the costs recorded in the quotation according to your permissions.", items: ["Related quotation", "Costs by service", "Associated customer", "Linked operation"], actions: ["View quotation", "Operation", "Customer"], details: ["The quotation with its costs by service would open.", "The operation linked to the quotation would open.", "The associated customer record would be shown."] },
      { name: "Operations", label: "Operational query", query: "Where is order 4587?", answer: "I search the available records according to your permissions.", items: ["Order 4587", "Operation status", "Related operation", "Available documents"], actions: ["View operation", "Documents", "Customer"], details: ["The related operation would open with its step-by-step tracking.", "The associated documents you can access would be shown.", "The customer record and its history would be shown."] },
      { name: "KPI", label: "Indicators query", query: "What is the margin of this operation?", answer: "I search the indicators recorded in the operation according to your permissions.", items: ["Budgeted costs", "Actual costs", "Budgeted margin", "Actual margin"], actions: ["View indicators", "Operation", "Costs"], details: ["The operation's recorded indicators would be shown.", "The related operation would open.", "Budgeted and actual costs would be shown."] },
    ],
  },
  "pt-BR": {
    kicker: "Logix aplicado", title: "Pergunte ao Logix sobre sua operação.",
    body: "Consulte as informações da sua operação de acordo com as permissões da sua equipe.",
    choose: "Escolha seu copiloto",
    modules: ["Clientes", "Prospects", "Operações", "Documentos", "DO", "Portal do cliente"],
    pause: "Pausar movimento", resume: "Retomar",
    copilots: [
      { name: "Comercial", label: "Consulta comercial", query: "Que atividade tem o prospect registrado esta semana?", answer: "Consulto as informações comerciais disponíveis de acordo com suas permissões.", items: ["Prospect e empresa", "Responsável atribuído", "Atividade registrada", "Histórico comercial"], actions: ["Ver prospect", "Histórico", "Cliente"], details: ["Seria aberta a ficha do prospect com sua atividade registrada.", "Seria exibido o histórico comercial disponível.", "Seria exibido o cadastro do cliente associado."] },
      { name: "Pricing · Rates", label: "Consulta de cotação", query: "Quais custos tem a cotação desta operação?", answer: "Consulto os custos registrados na cotação de acordo com suas permissões.", items: ["Cotação relacionada", "Custos por serviço", "Cliente associado", "Operação vinculada"], actions: ["Ver cotação", "Operação", "Cliente"], details: ["Seria aberta a cotação com seus custos por serviço.", "Seria aberta a operação vinculada à cotação.", "Seria exibido o cadastro do cliente associado."] },
      { name: "Operacional", label: "Consulta operacional", query: "Onde está o pedido 4587?", answer: "Consulto os registros disponíveis de acordo com suas permissões.", items: ["Pedido 4587", "Status da operação", "Operação relacionada", "Documentos disponíveis"], actions: ["Ver operação", "Documentos", "Cliente"], details: ["A operação relacionada seria aberta com seu acompanhamento por etapas.", "Seriam exibidos os documentos associados que você pode consultar.", "Seria exibido o cadastro do cliente com seu histórico."] },
      { name: "KPI", label: "Consulta de indicadores", query: "Qual é a margem desta operação?", answer: "Consulto os indicadores registrados na operação de acordo com suas permissões.", items: ["Custos orçados", "Custos reais", "Margem orçada", "Margem real"], actions: ["Ver indicadores", "Operação", "Custos"], details: ["Seriam exibidos os indicadores registrados da operação.", "Seria aberta a operação relacionada.", "Seriam exibidos os custos orçados e reais."] },
    ],
  },
};

export function LogixAI() {
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.es;
  const [active, setActive] = useState(2);
  const [shown, setShown] = useState(2);
  const [fading, setFading] = useState(false);
  const [action, setAction] = useState<number | null>(null);
  const [stopped, setStopped] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return () => mq.removeEventListener("change", on);
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => { io.disconnect(); mq.removeEventListener("change", on); };
  }, []);

  const go = (i: number) => {
    setActive(i);
    setAction(null);
    setElapsed(0);
    setFading(true);
    window.setTimeout(() => { setShown(i); setFading(false); }, 160);
  };

  const running = inView && !stopped && !hover && !focus && !reduced;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((v) => v + 100), 100);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (elapsed >= STEP_MS) go((active + 1) % 4);
  }, [elapsed, active]);

  const choose = (i: number) => {
    setStopped(true);
    if (i !== active) go(i);
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const map: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const n = (i + (map[e.key] ?? 0) + 4) % 4;
    btns.current[n]?.focus();
    choose(n);
  };

  const current = t.copilots[shown] ?? t.copilots[0]!;
  const rel = related[active] ?? [];
  const progress = reduced ? 0 : Math.min(elapsed / STEP_MS, 1);

  return (
    <section ref={ref} id="logix-ai" aria-labelledby="logix-title" className="section-shell surface-mid">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item lx4-head">
          <p className="section-kicker">{t.kicker}</p>
          <h2 id="logix-title" className="section-title-dark">{t.title}</h2>
          <p className="lx4-lead">{t.body}</p>
        </div>

        <div
          data-reveal
          className="reveal-item lx4-panel"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setFocus(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false); }}
        >
          <div className="lx4-left">
            <p className="lx4-label" id="lx4-choose">{t.choose}</p>
            <div role="radiogroup" aria-labelledby="lx4-choose" className="lx4-copilots">
              {t.copilots.map((c, i) => {
                const Icon = copilotIcons[i] ?? Settings;
                const on = active === i;
                return (
                  <button
                    key={i}
                    ref={(el) => { btns.current[i] = el; }}
                    type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1}
                    onClick={() => choose(i)} onKeyDown={(e) => onKey(e, i)}
                    className="lx4-copilot focus-ring" data-active={on ? "true" : undefined}
                  >
                    <Icon className="lx4-copilot-icon" aria-hidden="true" />
                    <span className="min-w-0 flex-1 text-left">{c.name}</span>
                    <ChevronRight className="lx4-chev" aria-hidden="true" />
                    {on && <span className="lx4-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setStopped((s) => !s)} className="lx4-pause focus-ring" aria-pressed={stopped}>
              {stopped ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
              {stopped ? t.resume : t.pause}
            </button>
          </div>

          <div className="lx4-center">
            <div className="lx4-avatar">
              <img src={logixAsset.url} alt="Logix" width={1254} height={1254} loading="lazy" />
            </div>
            <ul className="lx4-modules" aria-label={t.modules.join(", ")}>
              {t.modules.map((m, i) => {
                const Icon = moduleIcons[i] ?? FileText;
                return (
                  <li key={i} className="lx4-module" data-lit={rel.includes(i) ? "true" : undefined} style={{ transitionDelay: `${200 + i * 70}ms` }}>
                    <Icon aria-hidden="true" />
                    <span>{m}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lx4-right">
            <div className="lx4-swap" data-fading={fading ? "true" : undefined} aria-live="polite">
              <p className="lx4-label">{current.label}</p>
              <div className="lx4-q">
                <span className="lx4-user"><UserRound aria-hidden="true" /></span>
                <p className="lx4-bubble">{current.query}</p>
              </div>
              <div className="lx4-a">
                <img src={logixAsset.url} alt="" width={40} height={40} className="lx4-mini" loading="lazy" />
                <p>{current.answer}</p>
              </div>
              <ul className="lx4-results">
                {current.items.map((item) => (
                  <li key={item}><FileText aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <div className="lx4-actions">
                {current.actions.map((a, i) => (
                  <button key={a} type="button" aria-pressed={action === i} onClick={() => setAction(action === i ? null : i)}
                    className={`lx4-action focus-ring${i === 0 ? " lx4-action-primary" : ""}`}>
                    {a}{i === 0 && <ArrowRight aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <p className="lx4-detail">{action !== null ? current.details[action] : "\u00a0"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
