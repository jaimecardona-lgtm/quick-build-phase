import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ClipboardCheck, FileText, MonitorSmartphone, Pause, Play, Search, Settings2, UserRoundSearch, UsersRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import logixAsset from "@/assets/logix-transparent.png.asset.json";

const cardIcons = [UsersRound, UserRoundSearch, Settings2, FileText, ClipboardCheck, MonitorSmartphone];

type Copilot = { name: string; label: string; query: string; answer: string; items: string[] };
type Copy = {
  cards: string[]; copilotsLabel: string; illustrative: string; pause: string; play: string;
  copilots: Copilot[]; actionDetails: string[];
};

const copy: Record<"es" | "en" | "pt-BR", Copy> = {
  es: {
    cards: ["Clientes", "Prospectos", "Operaciones", "Documentos", "DO", "Portal cliente"],
    copilotsLabel: "Selecciona un copiloto", illustrative: "Ejemplo ilustrativo",
    pause: "Pausar movimiento", play: "Reanudar movimiento",
    copilots: [
      { name: "Copiloto Comercial", label: "Consulta comercial", query: "¿Qué actividad tiene el prospecto registrado esta semana?", answer: "Logix consulta la información comercial registrada según los permisos del usuario.", items: ["Prospecto y empresa", "Responsable asignado", "Actividad registrada", "Historial comercial"] },
      { name: "Copiloto Pricing · Rates", label: "Consulta de cotización", query: "¿Qué costos tiene la cotización de esta operación?", answer: "Logix consulta los costos registrados en la cotización según los permisos del usuario.", items: ["Cotización relacionada", "Costos por servicio", "Cliente asociado", "Operación vinculada"] },
      { name: "Copiloto Operativo", label: "Consulta operativa", query: "¿Dónde está el pedido 4587?", answer: "Logix consulta la información registrada según los permisos del usuario.", items: ["Pedido 4587", "Estado disponible en la operación", "Operación relacionada", "Documentos disponibles para ese usuario"] },
      { name: "Copiloto KPI", label: "Consulta de indicadores", query: "¿Cuál es el margen de esta operación?", answer: "Logix consulta los indicadores registrados en la operación según los permisos del usuario.", items: ["Costos presupuestados", "Costos reales", "Margen presupuestado", "Margen real"] },
    ],
    actionDetails: ["Se abriría la operación relacionada con su seguimiento por pasos.", "Se mostrarían los documentos asociados que el usuario puede consultar.", "Se mostraría el expediente del cliente con su historial."],
  },
  en: {
    cards: ["Customers", "Prospects", "Operations", "Documents", "DO", "Customer portal"],
    copilotsLabel: "Select a copilot", illustrative: "Illustrative example",
    pause: "Pause motion", play: "Resume motion",
    copilots: [
      { name: "Sales Copilot", label: "Sales query", query: "What activity does this week's prospect have?", answer: "Logix searches the recorded sales information according to the user's permissions.", items: ["Prospect and company", "Assigned owner", "Recorded activity", "Sales history"] },
      { name: "Pricing · Rates Copilot", label: "Quotation query", query: "What costs does this operation's quotation include?", answer: "Logix searches the costs recorded in the quotation according to the user's permissions.", items: ["Related quotation", "Costs by service", "Associated customer", "Linked operation"] },
      { name: "Operations Copilot", label: "Operational query", query: "Where is order 4587?", answer: "Logix searches the recorded information according to the user's permissions.", items: ["Order 4587", "Status available in the operation", "Related operation", "Documents available to that user"] },
      { name: "KPI Copilot", label: "Indicators query", query: "What is the margin of this operation?", answer: "Logix searches the indicators recorded in the operation according to the user's permissions.", items: ["Budgeted costs", "Actual costs", "Budgeted margin", "Actual margin"] },
    ],
    actionDetails: ["The related operation would open with its step-by-step tracking.", "The associated documents the user can access would be shown.", "The customer record and its history would be shown."],
  },
  "pt-BR": {
    cards: ["Clientes", "Prospects", "Operações", "Documentos", "DO", "Portal do cliente"],
    copilotsLabel: "Selecione um copiloto", illustrative: "Exemplo ilustrativo",
    pause: "Pausar movimento", play: "Retomar movimento",
    copilots: [
      { name: "Copiloto Comercial", label: "Consulta comercial", query: "Que atividade tem o prospect registrado esta semana?", answer: "Logix consulta as informações comerciais registradas de acordo com as permissões do usuário.", items: ["Prospect e empresa", "Responsável atribuído", "Atividade registrada", "Histórico comercial"] },
      { name: "Copiloto Pricing · Rates", label: "Consulta de cotação", query: "Quais custos tem a cotação desta operação?", answer: "Logix consulta os custos registrados na cotação de acordo com as permissões do usuário.", items: ["Cotação relacionada", "Custos por serviço", "Cliente associado", "Operação vinculada"] },
      { name: "Copiloto Operacional", label: "Consulta operacional", query: "Onde está o pedido 4587?", answer: "Logix consulta as informações registradas de acordo com as permissões do usuário.", items: ["Pedido 4587", "Status disponível na operação", "Operação relacionada", "Documentos disponíveis para esse usuário"] },
      { name: "Copiloto KPI", label: "Consulta de indicadores", query: "Qual é a margem desta operação?", answer: "Logix consulta os indicadores registrados na operação de acordo com as permissões do usuário.", items: ["Custos orçados", "Custos reais", "Margem orçada", "Margem real"] },
    ],
    actionDetails: ["A operação relacionada seria aberta com seu acompanhamento por etapas.", "Seriam exibidos os documentos associados que o usuário pode consultar.", "Seria exibido o cadastro do cliente com seu histórico."],
  },
};

export function LogixAI() {
  const { content, locale } = useLanguage();
  const { logix, ui } = content;
  const t = copy[locale] ?? copy.es;
  const [active, setActive] = useState(2);
  const [shown, setShown] = useState(2);
  const [fading, setFading] = useState(false);
  const [action, setAction] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [lit, setLit] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setLit((v) => (v + 1) % 6), 1800);
    return () => window.clearInterval(id);
  }, [inView, paused]);

  const choose = (i: number) => {
    if (i === active) return;
    setActive(i);
    setAction(null);
    setFading(true);
    window.setTimeout(() => { setShown(i); setFading(false); }, 150);
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const map: Record<string, number> = { ArrowRight: 1, ArrowDown: 2, ArrowLeft: -1, ArrowUp: -2 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const n = (i + (map[e.key] ?? 0) + 4) % 4;
    btns.current[n]?.focus();
    choose(n);
  };

  const current = t.copilots[shown] ?? t.copilots[0]!;
  const motionOn = inView && !paused;

  return (
    <section ref={ref} id="logix-ai" aria-labelledby="logix-title" className="section-shell surface-mid">
      <div className="logix3 mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item logix3-head">
          <p className="section-kicker">{ui.logixKicker}</p>
          <h2 id="logix-title" className="section-title-dark">{logix.title}</h2>
          <p className="section-lead-dark">{logix.body}</p>
        </div>

        <div className="logix3-row">
          <div data-reveal className="reveal-item logix2-cluster" data-motion={motionOn ? "on" : "off"}>
            <div className="logix2-avatar">
              <img src={logixAsset.url} alt="Logix" width={1254} height={1254} loading="lazy" />
            </div>
            <ul aria-label={ui.logixSources} className="logix2-cards">
              {t.cards.map((label, i) => {
                const Icon = cardIcons[i] ?? FileText;
                return (
                  <li key={label} tabIndex={0} className={`logix2-card logix2-card-${i + 1}`} data-lit={motionOn && lit === i ? "true" : undefined} style={{ transitionDelay: `${300 + i * 80}ms` }}>
                    <span className="logix-node-icon"><Icon aria-hidden="true" /></span>
                    <span>{label}</span>
                    <span className="logix-node-status" aria-hidden="true" />
                  </li>
                );
              })}
            </ul>
          </div>

          <div data-reveal className="reveal-item logix3-main">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-ui text-[11px] font-semibold tracking-[0.16em] text-skybrand uppercase">{current.label}</p>
              <span className="logix2-badge">{t.illustrative}</span>
            </div>
            <div className="logix-console" aria-live="polite">
              <div className="logix2-swap" data-fading={fading ? "true" : undefined}>
                <p className="flex items-start gap-3 font-ui text-sm text-on-dark">
                  <Search className="mt-0.5 h-4 w-4 shrink-0 text-skybrand" aria-hidden="true" />
                  <span><span className="font-semibold">{ui.query}</span> {current.query}</span>
                </p>
                <p className="logix3-answer font-ui text-sm leading-relaxed text-on-dark/70">{current.answer}</p>
                <ul className="logix-answer-details">
                  {current.items.map((item) => (
                    <li key={item} className="logix-result-row" style={{ opacity: 1, transform: "none" }}>
                      <FileText className="h-4 w-4 text-skybrand" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div role="radiogroup" aria-label={t.copilotsLabel} className="logix3-copilots">
          {t.copilots.map((c, i) => (
            <button
              key={c.name}
              ref={(el) => { btns.current[i] = el; }}
              type="button" role="radio" aria-checked={active === i} tabIndex={active === i ? 0 : -1}
              onClick={() => choose(i)} onKeyDown={(e) => onKey(e, i)}
              className="logix2-copilot focus-ring"
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="logix3-controls">
          <button type="button" onClick={() => setPaused((p) => !p)} className="logix2-pause focus-ring" aria-pressed={paused}>
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            {paused ? t.play : t.pause}
          </button>
          <ul className="logix3-actions">
            {logix.actions.map((chip, i) => (
              <li key={chip}>
                <button type="button" aria-pressed={action === i} onClick={() => setAction(action === i ? null : i)} className="logix2-action focus-ring">
                  {chip}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="logix2-action-detail" aria-live="polite">{action !== null ? t.actionDetails[action] : "\u00a0"}</p>
      </div>
    </section>
  );
}
