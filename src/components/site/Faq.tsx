import { useState } from "react";
import { BookOpen, Activity, Bot, FileText, Users, CreditCard, HelpCircle, Plus, Minus, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { FORWARDERS_V2 } from "@/lib/cinematic-assets";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";
import "./faq-zenox.css";

/*
 * variant "legacy" (por defecto): lista completa de preguntas (control de regresión de legacy-home).
 * variant "zenox": acordeón de dos niveles. Nivel 1: categorías cerradas. Nivel 2: preguntas de la categoría abierta;
 * cada respuesta se despliega al elegir su pregunta. Las respuestas siguen en el HTML (visibility oculta, no display none).
 * Los índices agrupan las preguntas por posición: el orden es el mismo en ES, EN y PT.
 */

type Lang = "es" | "en" | "pt";
type Group = { key: string; icon: LucideIcon; title: Record<Lang, string>; items: number[] };

const GROUPS: Group[] = [
  {
    key: "generalidades",
    icon: BookOpen,
    title: { es: "Generalidades de Logixtic", en: "About Logixtic", pt: "Sobre a Logixtic" },
    items: [0, 1, 2, 3],
  },
  {
    key: "operaciones",
    icon: Activity,
    title: { es: "Operaciones y productividad", en: "Operations and productivity", pt: "Operações e produtividade" },
    items: [4, 5, 7],
  },
  {
    key: "logix",
    icon: Bot,
    title: { es: "Logix e inteligencia artificial", en: "Logix and artificial intelligence", pt: "Logix e inteligência artificial" },
    items: [6],
  },
  {
    key: "documentos",
    icon: FileText,
    title: { es: "Documentos y portal de clientes", en: "Documents and customer portal", pt: "Documentos e portal do cliente" },
    items: [8, 9],
  },
  {
    key: "usuarios",
    icon: Users,
    title: { es: "Usuarios, permisos e implementación", en: "Users, permissions and implementation", pt: "Usuários, permissões e implementação" },
    items: [10, 11, 12],
  },
  {
    key: "planes",
    icon: CreditCard,
    title: { es: "Planes y siguiente paso", en: "Plans and next step", pt: "Planos e próximo passo" },
    items: [13, 14],
  },
];

const COUNT_LABEL: Record<Lang, [string, string]> = {
  es: ["pregunta", "preguntas"],
  en: ["question", "questions"],
  pt: ["pergunta", "perguntas"],
};
const OTHER_TITLE: Record<Lang, string> = { es: "Otras preguntas", en: "Other questions", pt: "Outras perguntas" };

// Agrupa todas las preguntas: las no asignadas van a un grupo final para que ninguna se pierda.
function buildGroups(total: number, lang: Lang): Group[] {
  const assigned = new Set(GROUPS.flatMap((g) => g.items));
  const rest = Array.from({ length: total }, (_, i) => i).filter((i) => !assigned.has(i));
  const groups = GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i < total) }));
  if (rest.length > 0) groups.push({ key: "otras", icon: HelpCircle, title: { es: OTHER_TITLE.es, en: OTHER_TITLE.en, pt: OTHER_TITLE.pt }, items: rest });
  return groups.filter((g) => g.items.length > 0 && g.title[lang]);
}

function FaqAccordion({ faqs, title, locale }: { faqs: ReadonlyArray<{ q: string; a: string }>; title: string; locale: string }) {
  const lang: Lang = locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";
  const groups = buildGroups(faqs.length, lang);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [singular, plural] = COUNT_LABEL[lang];

  return (
    <section id="faq" aria-labelledby="faq-title" className="section-shell surface-mid amb faq-zx">
      {FORWARDERS_V2 ? <DataNetworkLayer variant="network" /> : null}
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">{title}</p>
          <h2 id="faq-title" className="section-title-dark mt-4">
            {title}
          </h2>
        </div>
        <div className="faq-zx-list">
          {groups.map((g) => {
            const isOpen = openCat === g.key;
            const Icon = g.icon;
            const count = g.items.length;
            return (
              <div key={g.key} className="faq-zx-cat" data-open={isOpen ? "true" : "false"}>
                <button
                  type="button"
                  className="faq-zx-cat-btn focus-ring"
                  aria-expanded={isOpen}
                  aria-controls={`faq-cat-${g.key}`}
                  id={`faq-cat-btn-${g.key}`}
                  onClick={() => {
                    setOpenCat(isOpen ? null : g.key);
                    setOpenQ(null);
                  }}
                >
                  <span className="faq-zx-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <span className="faq-zx-cat-text">
                    <span className="faq-zx-cat-title">{g.title[lang]}</span>
                    <span className="faq-zx-cat-count">
                      {count} {count === 1 ? singular : plural}
                    </span>
                  </span>
                  <span className="faq-zx-toggle" aria-hidden="true">
                    {isOpen ? <Minus size={16} strokeWidth={1.8} /> : <Plus size={16} strokeWidth={1.8} />}
                  </span>
                </button>
                <div
                  id={`faq-cat-${g.key}`}
                  role="region"
                  aria-labelledby={`faq-cat-btn-${g.key}`}
                  className="faq-zx-panel"
                  data-open={isOpen ? "true" : "false"}
                >
                  <div className="faq-zx-panel-inner">
                    {g.items.map((i) => {
                      const item = faqs[i];
                      if (!item) return null;
                      const qOpen = openQ === i;
                      return (
                        <div key={i} className="faq-zx-q" data-open={qOpen ? "true" : "false"}>
                          <button
                            type="button"
                            className="faq-zx-q-btn focus-ring"
                            id={`faq-q-${i}`}
                            aria-expanded={qOpen}
                            aria-controls={`faq-a-${i}`}
                            onClick={() => {
                              const next = qOpen ? null : i;
                              setOpenQ(next);
                              if (next !== null) track("faq_open", { question: item.q, section_id: "faq" });
                            }}
                          >
                            <span>{item.q}</span>
                            <span className="faq-zx-toggle faq-zx-toggle--small" aria-hidden="true">
                              {qOpen ? <Minus size={14} strokeWidth={1.8} /> : <Plus size={14} strokeWidth={1.8} />}
                            </span>
                          </button>
                          <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq-zx-a" data-open={qOpen ? "true" : "false"}>
                            <div className="faq-zx-a-inner">
                              <p>{item.a}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Faq({ variant = "legacy" }: { variant?: "legacy" | "zenox" } = {}) {
  const { content, locale } = useLanguage();
  const { faqs, ui } = content;
  if (variant === "zenox") return <FaqAccordion faqs={faqs} title={ui.faqKicker} locale={locale} />;
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-shell surface-mid amb">
      {FORWARDERS_V2 ? <DataNetworkLayer variant="network" /> : null}
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">{ui.faqKicker}</p>
          <h2 id="faq-title" className="section-title-dark mt-4">
            {ui.faqKicker}
          </h2>
        </div>
        <div className="mt-12 grid gap-3 lg:grid-cols-2">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="faq-item"
              onToggle={(event) => {
                if ((event.currentTarget as HTMLDetailsElement).open) {
                  track("faq_open", { question: item.q, section_id: "faq" });
                }
              }}
            >
              <summary className="focus-ring">
                <span className="font-ui text-sm font-medium text-on-dark">{item.q}</span>
                <Plus className="h-4 w-4 shrink-0 text-skybrand" aria-hidden="true" />
              </summary>
              <p className="mt-3 font-ui text-sm leading-relaxed text-on-dark/68">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
