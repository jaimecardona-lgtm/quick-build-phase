import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Calculator, MessageCircle, Send, Volume2, VolumeX, X } from "lucide-react";
import { WHATSAPP_ADVISOR_URL } from "@/lib/whatsapp";
import logixAsset from "@/assets/logix-transparent.png.asset.json";
import {
  askCommercialAssistant,
  calculateRoi,
  getCommercialAssistantStatus,
  type AgentErrorCode,
  type AgentStatus,
  type ChatResult,
  type RoiResult,
} from "@/lib/agent.functions";
import { useLanguage, type Locale } from "@/lib/i18n";
import {
  WIDGET_LABELS,
  widgetLang,
  type WidgetLang,
} from "@/components/experience/agent-widget-labels";
import "@/components/experience/agent-widget.css";

/*
 * Logix Web: asistente comercial público. Solo consume contenido aprobado a través de funciones de
 * servidor; ninguna clave llega al navegador. Sin login. Convive con el botón de WhatsApp (esquina opuesta)
 * y con la demostración operativa de LogixAI, que no se modifica.
 */

// Visible en desarrollo local por defecto; en producción solo con VITE_LOGIXTIC_AGENT=true.
const AGENT_WIDGET_ENABLED =
  import.meta.env.DEV || import.meta.env["VITE_LOGIXTIC_AGENT"] === "true";

// Intención comercial verificable: términos de demostración, precio, planes, implementación o contacto comercial.
const COMMERCIAL_INTENT =
  /demo|demostraci|cu[aá]nto cuesta|precio|tarifa|planes?|implement|contrat|comprar|ventas|asesor|vendedor|hablar con alguien|pricing|price|sales|buy|hire|quanto custa|preço|contratar|consultor/i;

type Message =
  | { role: "user"; text: string }
  | { role: "greeting"; text: string }
  | { role: "offer" }
  | {
      role: "assistant";
      text: string;
      sources: string[];
      dryRun: boolean;
      degraded: boolean;
      refused: boolean;
    }
  | { role: "error"; code: AgentErrorCode };

type Tab = "chat" | "roi";

function backendLocale(locale: Locale): "es" | "en" | "pt-BR" {
  return locale === "en" ? "en" : locale === "pt-BR" ? "pt-BR" : "es";
}

function errorText(code: AgentErrorCode, t: (typeof WIDGET_LABELS)["es"]): string {
  switch (code) {
    case "unavailable":
      return t.errUnavailable;
    case "rate_limited":
      return t.errRateLimited;
    case "invalid":
      return t.errInvalid;
    case "misconfigured":
      return t.errMisconfigured;
    default:
      return t.errGeneric;
  }
}

function AgentWidgetPanel() {
  const { locale, content } = useLanguage();
  const lang: WidgetLang = widgetLang(locale);
  const t = WIDGET_LABELS[lang];
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const greetedRef = useRef(false);
  const offerDoneRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Preguntas sugeridas: FAQ aprobadas del idioma activo (texto existente, no nuevo).
  const suggestions = [0, 6, 11].map((i) => content.faqs[i]?.q).filter((q): q is string => !!q);

  useEffect(() => {
    let active = true;
    getCommercialAssistantStatus().then((result) => {
      if (active) setStatus(result);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy]);

  const sourceLabel = (id: string): string => {
    const match = /(\d{2})$/.exec(id);
    if (id.startsWith("logix") || id.startsWith("flow") || !match) return t.approvedSource;
    const index = Number(match[1]) - 1;
    return content.faqs[index]?.q ?? t.approvedSource;
  };

  // Síntesis de voz del navegador: solo se llama desde un clic del visitante. Sin voz disponible, queda el texto.
  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !voiceOn) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-CO";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Saludo: se añade y se lee solo la primera vez que se abre; al reabrir no se repite.
  const toggleOpen = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!greetedRef.current) {
      greetedRef.current = true;
      setMessages((prev) => [...prev, { role: "greeting", text: t.greeting }]);
      speak(t.greeting);
    }
  };

  useEffect(() => {
    if (!open && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [open]);

  // Reintenta la comprobación de estado (p. ej., tras un fallo temporal de conexión).
  const retryStatus = () => {
    setStatus(null);
    void getCommercialAssistantStatus().then(setStatus);
  };

  const ask = async (question: string) => {
    const message = question.trim();
    if (!message || busy) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setDraft("");
    setBusy(true);
    let result: ChatResult;
    try {
      result = await askCommercialAssistant({ data: { message, locale: backendLocale(locale) } });
    } catch {
      result = { ok: false, code: "unavailable" };
    }
    setBusy(false);
    if (result.ok) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: result.text,
          sources: result.sources,
          dryRun: result.dryRun,
          degraded: result.degraded,
          refused: result.refused,
        },
      ]);
    } else {
      setMessages((prev) => [...prev, { role: "error", code: result.code }]);
    }
    // Oferta de asesor: una sola vez, después de responder, solo si hay intención comercial clara.
    if (!offerDoneRef.current && COMMERCIAL_INTENT.test(message)) {
      offerDoneRef.current = true;
      setMessages((prev) => [...prev, { role: "offer" }]);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    inputRef.current?.focus();
    void ask(draft);
  };

  // Cierre: vuelve el foco al launcher, que siempre está habilitado.
  const closePanel = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && open) closePanel();
  };

  const modeLabel = !status
    ? null
    : status.ok
      ? status.dryRun
        ? t.modeDry
        : t.modeReal
      : t.modeUnavailable;

  return (
    <div className="aw-root" onKeyDown={onKeyDown}>
      {open ? (
        <section
          id="aw-panel"
          className="aw-panel"
          role="dialog"
          aria-label={t.title}
          aria-modal="false"
        >
          <header className="aw-head">
            <img className="aw-avatar" src={logixAsset.url} alt="" width={40} height={40} />
            <div className="aw-title">
              <strong>{t.title}</strong>
              {modeLabel ? (
                <span className="aw-mode" data-dry={status?.ok && status.dryRun}>
                  {modeLabel}
                </span>
              ) : null}
            </div>
            {status && !status.ok ? (
              <button type="button" className="aw-retry focus-ring" onClick={retryStatus}>
                {t.retry}
              </button>
            ) : null}
            <button
              type="button"
              className="aw-icon focus-ring"
              aria-pressed={voiceOn}
              aria-label={voiceOn ? t.voiceOff : t.voiceOn}
              onClick={() => {
                if (voiceOn && typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
                setVoiceOn((v) => !v);
              }}
            >
              {voiceOn ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="aw-icon focus-ring"
              onClick={closePanel}
              aria-label={t.close}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div className="aw-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "chat"}
              className="aw-tab focus-ring"
              onClick={() => setTab("chat")}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t.tabChat}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "roi"}
              className="aw-tab focus-ring"
              onClick={() => setTab("roi")}
            >
              <Calculator className="h-4 w-4" aria-hidden="true" /> {t.tabRoi}
            </button>
          </div>

          {tab === "chat" ? (
            <>
              <div ref={listRef} className="aw-list" role="log" aria-live="polite">
                <p className="aw-intro">{t.intro}</p>
                {messages.length === 0 ? (
                  <ul className="aw-suggest" aria-label={t.suggestions}>
                    {suggestions.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          className="aw-chip focus-ring"
                          onClick={() => {
                            inputRef.current?.focus();
                            void ask(q);
                          }}
                          disabled={busy}
                        >
                          {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <p key={i} className="aw-bubble aw-user">
                      {m.text}
                    </p>
                  ) : m.role === "greeting" ? (
                    <div key={i} className="aw-bubble aw-bot">
                      <p>{m.text}</p>
                    </div>
                  ) : m.role === "offer" ? (
                    <div key={i} className="aw-bubble aw-bot aw-offer">
                      <p>{t.offer}</p>
                      <div className="aw-offer-actions">
                        <a
                          className="aw-offer-yes focus-ring"
                          href={WHATSAPP_ADVISOR_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.offerYes}
                        </a>
                        <button
                          type="button"
                          className="aw-offer-no focus-ring"
                          onClick={() => setMessages((prev) => prev.filter((_, j) => j !== i))}
                        >
                          {t.offerNo}
                        </button>
                      </div>
                    </div>
                  ) : m.role === "error" ? (
                    <p key={i} className="aw-bubble aw-error">
                      {errorText(m.code, t)}
                    </p>
                  ) : (
                    <div key={i} className="aw-bubble aw-bot">
                      <p>{m.text}</p>
                      {m.degraded && !m.refused ? (
                        <small className="aw-note">{m.dryRun ? t.modeDry : t.modeDegraded}</small>
                      ) : null}
                      {m.sources.length > 0 ? (
                        <div className="aw-sources">
                          <span>{t.sources}</span>
                          <ul>
                            {[...new Set(m.sources)].map((id) => (
                              <li key={id}>{sourceLabel(id)}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ),
                )}
                {busy ? <p className="aw-bubble aw-bot aw-thinking">{t.thinking}</p> : null}
              </div>
              <form className="aw-form" onSubmit={onSubmit}>
                <label className="aw-sr" htmlFor="aw-input">
                  {t.placeholder}
                </label>
                <input
                  ref={inputRef}
                  id="aw-input"
                  className="aw-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={800}
                  placeholder={t.placeholder}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="aw-send focus-ring"
                  disabled={busy || !draft.trim()}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="aw-sr">{t.send}</span>
                </button>
              </form>
            </>
          ) : (
            <RoiPanel t={t} />
          )}
        </section>
      ) : null}

      <button
        type="button"
        ref={launcherRef}
        className="aw-launcher focus-ring"
        aria-expanded={open}
        aria-controls="aw-panel"
        onClick={toggleOpen}
      >
        <img src={logixAsset.url} alt="" width={28} height={28} />
        <span>{t.open}</span>
      </button>
    </div>
  );
}

function RoiPanel({ t }: { t: (typeof WIDGET_LABELS)["es"] }) {
  const [ops, setOps] = useState("100");
  const [hours, setHours] = useState("2");
  const [cost, setCost] = useState("20");
  const [reduction, setReduction] = useState("25");
  const [software, setSoftware] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RoiResult | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await calculateRoi({
        data: {
          monthlyOperations: Number(ops),
          manualHoursPerOperation: Number(hours),
          loadedHourlyCost: Number(cost),
          reductionAssumptionPct: Number(reduction),
          logixticMonthlyCost: software.trim() === "" ? undefined : Number(software),
        },
      });
      setResult(response);
    } catch {
      setResult({ ok: false, code: "unavailable" });
    }
    setBusy(false);
  };

  return (
    <form className="aw-roi" onSubmit={submit}>
      <p className="aw-roi-title">{t.roiTitle}</p>
      <label>
        {t.roiOps}
        <input type="number" min={1} value={ops} onChange={(e) => setOps(e.target.value)} />
      </label>
      <label>
        {t.roiHours}
        <input
          type="number"
          min={0.01}
          step="0.01"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
      </label>
      <label>
        {t.roiCost}
        <input
          type="number"
          min={0.01}
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
      </label>
      <label>
        {t.roiReduction}
        <input
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={reduction}
          onChange={(e) => setReduction(e.target.value)}
        />
      </label>
      <label>
        {t.roiSoftware}
        <input
          type="number"
          min={0}
          step="0.01"
          value={software}
          onChange={(e) => setSoftware(e.target.value)}
        />
      </label>
      <button type="submit" className="aw-send-wide focus-ring" disabled={busy}>
        {t.roiCalculate}
      </button>
      {result ? (
        result.ok ? (
          <div className="aw-roi-result" aria-live="polite">
            <p>
              {t.roiGross}: <strong>{result.grossMonthlySaving}</strong>
            </p>
            {result.netMonthlySaving !== null ? (
              <p>
                {t.roiNet}: <strong>{result.netMonthlySaving}</strong>
              </p>
            ) : null}
            <small>
              {t.roiNote} ({t.roiVersion}: {result.assumptionsVersion})
            </small>
          </div>
        ) : (
          <p className="aw-error" role="alert">
            {errorText(result.code, t)}
          </p>
        )
      ) : null}
    </form>
  );
}

export function AgentWidget() {
  if (!AGENT_WIDGET_ENABLED) return null;
  return <AgentWidgetPanel />;
}
