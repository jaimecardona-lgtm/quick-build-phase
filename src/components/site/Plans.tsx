
import { ArrowRight, Check, Code2, Layers, PenTool, Plug, SearchCheck, Settings, Sparkles, TrendingUp } from "lucide-react";
import { useDemoUrl } from "@/hooks/use-demo-url";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";

type Plan = { id: string; name: string; tag?: string; badge?: string; desc: string; items: string[]; featured?: boolean };
type PlanIcon = typeof Layers;

const planIcons: Record<string, PlanIcon> = {
  standard: Layers,
  enterprise: TrendingUp,
  setup: Settings,
};

const copy = {
  es: {
    custom: { name: "Custom", subtitle: "Personalización de tu plan", desc: "Adapta tu plan Standard o Enterprise a las necesidades de tu operación.", items: ["Auditoría de diseño técnico.", "Arquitectura y diseño UX/UI.", "Integraciones personalizadas mediante APIs.", "Funcionalidades a la medida."], note: "Alcance y condiciones definidos en la propuesta de tu plan.", cta: "Habla con un experto", newTab: "(abre en una pestaña nueva)" },
    titleStart: "Planes diseñados para escalar tu operación",
    titleEnd: "logística",
    body: "Nuestro enfoque está en darte control real sobre la operación, trazabilidad de cada proceso, visibilidad del margen por operación y una mejor experiencia para tus clientes.",
    cta: "Más información",
    newTab: "(abre WhatsApp en una pestaña nueva)",
    msg: (n: string) => `Hola, quiero más información sobre el plan ${n} de Logixtic.`,
    plans: [
      { id: "standard", name: "Standard", desc: "Ideal para agentes que inician su transformación digital.", items: ["Todas las funcionalidades completas de Logixtic®", "PDF Maker Basic (Módulo Cotizaciones)", "Automatizaciones Básicas (Módulo Operaciones)", "2h de Capacitación por Módulo", "De 3 Hasta 9 Usuarios", "Soporte Técnico 24/7"] },
      { id: "enterprise", name: "Enterprise", badge: "Ahorra hasta un 15%", featured: true, desc: "Perfecto para agentes en crecimiento y expansión.", items: ["Todas las funcionalidades completas de Logixtic®", "PDF Maker Professional ilimitado por módulo", "Automatizaciones ilimitadas por módulo", "4h de capacitación por módulo", "Para 10+ Usuarios", "Soporte Técnico 24/7"] },
      { id: "setup", name: "Implementación · Setup Fee", tag: "Pago único", desc: "Implementación profesional y personalizada.", items: ["Onboarding y Configuración inicial de la plataforma", "Personalización de flujos y documentos (según plan)", "Migración básica de datos (clientes, contactos y agentes o proveedores)", "Capacitación completa al equipo", "Implementación, pruebas y puesta en marcha", "Seguridad y roles de usuarios configurados acordes a certificación Basc e ISO 28000", "Acompañamiento en go-live"] },
    ] as Plan[],
  },
  en: {
    custom: { name: "Custom", subtitle: "Customize your plan", desc: "Tailor your Standard or Enterprise plan to the needs of your operation.", items: ["Technical design audit.", "UX/UI architecture and design.", "Custom integrations via APIs.", "Tailor-made features."], note: "Scope and conditions defined in your plan proposal.", cta: "Talk to an expert", newTab: "(opens in a new tab)" },
    titleStart: "Plans designed to scale your",
    titleEnd: "logistics operation",
    body: "Our focus is on giving you real control over the operation, traceability of every process, visibility of the margin per operation and a better experience for your customers.",
    cta: "More information",
    newTab: "(opens WhatsApp in a new tab)",
    msg: (n: string) => `Hello, I would like more information about the Logixtic ${n} plan.`,
    plans: [
      { id: "standard", name: "Standard", desc: "Ideal for agents starting their digital transformation.", items: ["All Logixtic® features included", "PDF Maker Basic (Quotes module)", "Basic automations (Operations module)", "2h of training per module", "From 3 up to 9 users", "24/7 technical support"] },
      { id: "enterprise", name: "Enterprise", badge: "Save up to 15%", featured: true, desc: "Perfect for growing and expanding agents.", items: ["All Logixtic® features included", "Unlimited PDF Maker Professional per module", "Unlimited automations per module", "4h of training per module", "For 10+ users", "24/7 technical support"] },
      { id: "setup", name: "Implementation · Setup Fee", tag: "One-time payment", desc: "Professional, customized implementation.", items: ["Onboarding and initial platform configuration", "Customization of workflows and documents (per plan)", "Basic data migration (customers, contacts and agents or suppliers)", "Full team training", "Implementation, testing and go-live", "User security and roles configured according to BASC and ISO 28000 certification", "Go-live support"] },
    ] as Plan[],
  },
  pt: {
    custom: { name: "Custom", subtitle: "Personalização do seu plano", desc: "Adapte seu plano Standard ou Enterprise às necessidades da sua operação.", items: ["Auditoria de design técnico.", "Arquitetura e design UX/UI.", "Integrações personalizadas via APIs.", "Funcionalidades sob medida."], note: "Escopo e condições definidos na proposta do seu plano.", cta: "Fale com um especialista", newTab: "(abre em uma nova aba)" },
    titleStart: "Planos criados para escalar sua operação",
    titleEnd: "logística",
    body: "Nosso foco é dar a você controle real sobre a operação, rastreabilidade de cada processo, visibilidade da margem por operação e uma melhor experiência para seus clientes.",
    cta: "Mais informações",
    newTab: "(abre o WhatsApp em uma nova aba)",
    msg: (n: string) => `Olá, quero mais informações sobre o plano ${n} da Logixtic.`,
    plans: [
      { id: "standard", name: "Standard", desc: "Ideal para agentes que estão iniciando sua transformação digital.", items: ["Todas as funcionalidades completas do Logixtic®", "PDF Maker Basic (Módulo Cotações)", "Automações básicas (Módulo Operações)", "2h de treinamento por módulo", "De 3 até 9 usuários", "Suporte técnico 24/7"] },
      { id: "enterprise", name: "Enterprise", badge: "Economize até 15%", featured: true, desc: "Perfeito para agentes em crescimento e expansão.", items: ["Todas as funcionalidades completas do Logixtic®", "PDF Maker Professional ilimitado por módulo", "Automações ilimitadas por módulo", "4h de treinamento por módulo", "Para 10+ usuários", "Suporte técnico 24/7"] },
      { id: "setup", name: "Implementação · Setup Fee", tag: "Pagamento único", desc: "Implementação profissional e personalizada.", items: ["Onboarding e configuração inicial da plataforma", "Personalização de fluxos e documentos (conforme o plano)", "Migração básica de dados (clientes, contatos e agentes ou fornecedores)", "Treinamento completo da equipe", "Implementação, testes e entrada em operação", "Segurança e perfis de usuários configurados de acordo com a certificação BASC e ISO 28000", "Acompanhamento no go-live"] },
    ] as Plan[],
  },
};

const waLink = (text: string) => `https://wa.me/573189733174?text=${encodeURIComponent(text)}`;

const customIcons = [SearchCheck, PenTool, Plug, Code2];

export function Plans() {
  const { locale } = useLanguage();
  const demoUrl = useDemoUrl();
  const t = copy[locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es"];
  const cards = t.plans.filter((p) => p.id !== "setup");
  const setup = t.plans.find((p) => p.id === "setup")!;
  const c = t.custom;
  const Cta = ({ plan }: { plan: Plan }) => (
    <a
      href={waLink(t.msg(plan.name))}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("plan_info_click", { plan: plan.id, section_id: "planes" })}
      className="focus-ring plans-cta"
    >
      {t.cta} <span className="sr-only">{plan.name} {t.newTab}</span>
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
  const Head = ({ plan, Icon, sub }: { plan: Plan; Icon: typeof Layers; sub?: string }) => (
    <div className="plans-head">
      <span className="plans-icon" aria-hidden="true"><Icon className="h-5 w-5" /></span>
      <div>
        <h3 className="plans-name title-h3">
          {plan.name}
          {plan.tag && <span className="plans-tag font-ui">{plan.tag}</span>}
        </h3>
        {plan.badge && <p className="plans-badge font-ui">{plan.badge}</p>}
        {sub && <p className="plans-sub font-ui">{sub}</p>}
      </div>
    </div>
  );
  const List = ({ items, icons }: { items: string[]; icons?: (typeof Layers)[] }) => (
    <ul className="plans-list">
      {items.map((item, i) => {
        const I = icons?.[i] ?? Check;
        return (
          <li key={item} className="font-ui">
            <span className={icons ? "plans-check plans-check-icon" : "plans-check"} aria-hidden="true"><I /></span>
            <span>{item}</span>
          </li>
        );
      })}
    </ul>
  );
  return (
    <section id="planes" aria-labelledby="planes-title" className="section-shell surface-deep">
      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <div data-reveal className="reveal-item mx-auto max-w-3xl text-center">
          <h2 id="planes-title" className="section-title-dark">
            {t.titleStart} <span className="text-amber">{t.titleEnd}</span>
          </h2>
          <p className="mx-auto mt-4 font-ui text-base leading-relaxed text-on-dark/75">{t.body}</p>
        </div>
        <div className="plans-grid mt-10">
          {cards.map((plan) => (
            <article key={plan.id} data-reveal className="reveal-item plans-card" data-plan={plan.id} data-featured={!!plan.featured}>
              <Head plan={plan} Icon={planIcons[plan.id] ?? Layers} />
              <p className="plans-desc font-ui">{plan.desc}</p>
              <List items={plan.items} />
              <Cta plan={plan} />
            </article>
          ))}
          <article data-reveal className="reveal-item plans-card" data-plan="custom" data-featured="false">
            <Head plan={{ id: "custom", name: c.name, desc: c.desc, items: c.items }} Icon={Sparkles} sub={c.subtitle} />
            <p className="plans-desc font-ui">{c.desc}</p>
            <List items={c.items} icons={customIcons} />
            <p className="plans-note font-ui">{c.note}</p>
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("demo_cta_click", { section_id: "planes_custom" })}
              className="focus-ring plans-cta"
            >
              {c.cta} <span className="sr-only">{c.newTab}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        </div>
        <article data-reveal className="reveal-item plans-card plans-setup mt-5" data-plan="setup" data-featured="false">
          <div className="plans-setup-main">
            <Head plan={setup} Icon={Settings} />
            <p className="plans-desc font-ui">{setup.desc}</p>
            <Cta plan={setup} />
          </div>
          <List items={setup.items} />
        </article>
      </div>
    </section>
  );
}
