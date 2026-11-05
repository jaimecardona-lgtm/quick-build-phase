/*
 * Copy de la vista previa Zenox (/zenox-preview).
 * - ES: texto aprobado del documento "Logixtic® — Copy y SEO del sitio web (v1)", copiado literalmente.
 *   Las etiquetas de interfaz marcadas con "(interfaz)" no están en el documento y siguen pendientes de validación.
 * - EN y PT-BR: BORRADORES de traducción. No están aprobados por el equipo comercial; no publicar sin revisión.
 * Este archivo vive fuera de src/components/site/ para no alterar scripts/content-baseline.json
 * (la Home "/" y su baseline de copy no se modifican).
 */

type Lang = "es" | "en" | "pt";

export const PREVIEW_COPY = {
  es: {
    notice: "Vista previa interna · contenido en revisión comercial, no publicado",
    hero: {
      eyebrow: "Software para Freight Forwarders en Latinoamérica",
      h1Start: "Software para agentes de carga",
      h1End: "impulsado por IA",
      support: "No necesitas otro software. Necesitas un Sistema Operativo.",
      body: "Logixtic® es el Sistema Operativo que conecta tu gestión comercial, operativa, documental y financiera. Es el software para Freight Forwarders que permite a tu equipo operar más embarques, con más control y con el margen de cada operación a la vista.",
      ctaPrimary: "Agenda diagnóstico operativo",
      ctaSecondary: "Descubre dónde estás perdiendo margen",
      micro:
        "Exclusivo para agentes de carga (Freight Forwarders) de LATAM. El diagnóstico se hace con tus propios números.",
      nodeOne: "Operación conectada",
      nodeTwo: "Margen visible",
      ariaCaption: "Vista previa de capturas de Logixtic (datos demostrativos)",
    },
    platform: {
      kicker: "De la fragmentación al control",
      h2: "De Excel, correos y WhatsApp a una sola fuente de información",
      tabsLabel: "Etapas de la operación",
      states: [
        {
          label: "01 · Información dispersa",
          title: "Información dispersa",
          body: "Hojas de cálculo desactualizadas, documentos sueltos, cotizaciones sin seguimiento, HBL, HAWB y certificados en carpetas distintas.",
          alt: "Captura de Logixtic: resumen comercial con actividad registrada (datos demostrativos)",
        },
        {
          label: "02 · Conexión",
          title: "Conexión",
          body: "Cliente, cotización, operación y documentos quedan vinculados.",
          alt: "Captura de Logixtic: seguimiento operativo por pasos (datos demostrativos)",
        },
        {
          label: "03 · Control",
          title: "Control",
          body: "Trazabilidad, indicadores y margen por operación en un solo lugar.",
          alt: "Captura de Logixtic: costos y margen de la operación (datos demostrativos)",
        },
      ],
    },
    services: {
      kicker: "Capacidades del software",
      h2: "El software para agentes de carga que cubre toda tu operación, del prospecto a la liquidación",
      tabsLabel: "Grupos de capacidades",
      pending: "Pendiente de validación en producción",
      groups: [
        {
          name: "Gestión comercial",
          caps: [
            {
              name: "CRM para agentes de carga",
              text: "Cada oportunidad queda registrada con empresa, responsable y actividad.",
            },
            {
              name: "Cotizaciones y tarifas",
              text: "La propuesta se construye sobre información comercial ya registrada.",
            },
            {
              name: "Vinculación de clientes",
              text: "El prospecto se convierte en cliente conservando su historial.",
            },
          ],
        },
        {
          name: "Gestión operativa",
          caps: [
            {
              name: "Operaciones y DO",
              text: "Cada operación avanza por pasos, con responsables y fechas visibles.",
            },
            {
              name: "Gestión documental",
              text: "HBL, HAWB, certificados y soportes asociados al cliente y a la operación.",
            },
            {
              name: "Trazabilidad",
              text: "Un checklist que muestra qué está hecho y qué falta en cada embarque.",
            },
          ],
        },
        {
          name: "Control y rentabilidad",
          caps: [
            {
              name: "Margen por operación",
              text: "Costos presupuestados, costos reales y margen consultables en la propia operación.",
            },
            {
              name: "Portal de clientes",
              text: "Tus clientes consultan cotizaciones, operaciones, documentos y seguimiento sin escribirte.",
              pending: true,
            },
          ],
        },
      ],
    },
  },
  en: {
    notice: "Internal preview · content under commercial review, not published",
    hero: {
      eyebrow: "Software for freight forwarders in Latin America",
      h1Start: "Software for freight forwarders",
      h1End: "powered by AI",
      support: "You don't need more software. You need an Operating System.",
      body: "Logixtic® is the Operating System that connects your sales, operations, documents and finance. It is the freight forwarding software that lets your team handle more shipments, with more control and your margin on every operation in view.",
      ctaPrimary: "Book an operational diagnostic",
      ctaSecondary: "Find out where you are losing margin",
      micro: "Built for freight forwarders in LATAM. The diagnostic uses your own numbers.",
      nodeOne: "Connected operation",
      nodeTwo: "Visible margin",
      ariaCaption: "Logixtic screenshot preview (demonstration data)",
    },
    platform: {
      kicker: "From fragmentation to control",
      h2: "From Excel, emails and WhatsApp to a single source of information",
      tabsLabel: "Operation stages",
      states: [
        {
          label: "01 · Scattered information",
          title: "Scattered information",
          body: "Outdated spreadsheets, loose documents, quotes without follow-up, HBL, HAWB and certificates in separate folders.",
          alt: "Logixtic screenshot: sales summary with recorded activity (demonstration data)",
        },
        {
          label: "02 · Connection",
          title: "Connection",
          body: "Client, quote, operation and documents are linked.",
          alt: "Logixtic screenshot: step-by-step operation tracking (demonstration data)",
        },
        {
          label: "03 · Control",
          title: "Control",
          body: "Traceability, indicators and margin per operation in one place.",
          alt: "Logixtic screenshot: operation costs and margin (demonstration data)",
        },
      ],
    },
    services: {
      kicker: "Software capabilities",
      h2: "The software for freight forwarders that covers your whole operation, from prospect to settlement",
      tabsLabel: "Capability groups",
      pending: "Pending production validation",
      groups: [
        {
          name: "Sales management",
          caps: [
            {
              name: "CRM for freight forwarders",
              text: "Every opportunity is recorded with company, owner and activity.",
            },
            {
              name: "Quotes and rates",
              text: "The proposal is built on commercial information already recorded.",
            },
            {
              name: "Client linking",
              text: "The prospect becomes a client while keeping its history.",
            },
          ],
        },
        {
          name: "Operations management",
          caps: [
            {
              name: "Operations and DO",
              text: "Each operation moves through steps, with visible owners and dates.",
            },
            {
              name: "Document management",
              text: "HBL, HAWB, certificates and supporting documents linked to the client and the operation.",
            },
            {
              name: "Traceability",
              text: "A checklist showing what is done and what is missing in each shipment.",
            },
          ],
        },
        {
          name: "Control and profitability",
          caps: [
            {
              name: "Margin per operation",
              text: "Budgeted costs, actual costs and margin visible within the operation itself.",
            },
            {
              name: "Client portal",
              text: "Your clients check quotes, operations, documents and tracking without writing to you.",
              pending: true,
            },
          ],
        },
      ],
    },
  },
  pt: {
    notice: "Prévia interna · conteúdo em revisão comercial, não publicado",
    hero: {
      eyebrow: "Software para Freight Forwarders na América Latina",
      h1Start: "Software para agentes de carga",
      h1End: "com IA",
      support: "Você não precisa de mais um software. Precisa de um Sistema Operacional.",
      body: "A Logixtic® é o Sistema Operacional que conecta sua gestão comercial, operacional, documental e financeira. É o software para Freight Forwarders que permite à sua equipe operar mais embarques, com mais controle e com a margem de cada operação à vista.",
      ctaPrimary: "Agende um diagnóstico operacional",
      ctaSecondary: "Descubra onde está perdendo margem",
      micro:
        "Exclusivo para agentes de carga (Freight Forwarders) da LATAM. O diagnóstico é feito com os seus próprios números.",
      nodeOne: "Operação conectada",
      nodeTwo: "Margem visível",
      ariaCaption: "Prévia de capturas da Logixtic (dados demonstrativos)",
    },
    platform: {
      kicker: "Da fragmentação ao controle",
      h2: "Do Excel, e-mails e WhatsApp a uma única fonte de informação",
      tabsLabel: "Etapas da operação",
      states: [
        {
          label: "01 · Informação dispersa",
          title: "Informação dispersa",
          body: "Planilhas desatualizadas, documentos soltos, cotações sem acompanhamento, HBL, HAWB e certificados em pastas diferentes.",
          alt: "Captura da Logixtic: resumo comercial com atividade registrada (dados demonstrativos)",
        },
        {
          label: "02 · Conexão",
          title: "Conexão",
          body: "Cliente, cotação, operação e documentos ficam vinculados.",
          alt: "Captura da Logixtic: acompanhamento operacional por etapas (dados demonstrativos)",
        },
        {
          label: "03 · Controle",
          title: "Controle",
          body: "Rastreabilidade, indicadores e margem por operação em um só lugar.",
          alt: "Captura da Logixtic: custos e margem da operação (dados demonstrativos)",
        },
      ],
    },
    services: {
      kicker: "Capacidades do software",
      h2: "O software para agentes de carga que cobre toda a sua operação, do prospect à liquidação",
      tabsLabel: "Grupos de capacidades",
      pending: "Pendente de validação em produção",
      groups: [
        {
          name: "Gestão comercial",
          caps: [
            {
              name: "CRM para agentes de carga",
              text: "Cada oportunidade fica registrada com empresa, responsável e atividade.",
            },
            {
              name: "Cotações e tarifas",
              text: "A proposta é construída sobre informação comercial já registrada.",
            },
            {
              name: "Vinculação de clientes",
              text: "O prospect vira cliente mantendo o seu histórico.",
            },
          ],
        },
        {
          name: "Gestão operacional",
          caps: [
            {
              name: "Operações e DO",
              text: "Cada operação avança por etapas, com responsáveis e datas visíveis.",
            },
            {
              name: "Gestão documental",
              text: "HBL, HAWB, certificados e documentos de apoio vinculados ao cliente e à operação.",
            },
            {
              name: "Rastreabilidade",
              text: "Um checklist que mostra o que está feito e o que falta em cada embarque.",
            },
          ],
        },
        {
          name: "Controle e rentabilidade",
          caps: [
            {
              name: "Margem por operação",
              text: "Custos orçados, custos reais e margem consultáveis na própria operação.",
            },
            {
              name: "Portal de clientes",
              text: "Seus clientes consultam cotações, operações, documentos e acompanhamento sem precisar escrever para você.",
              pending: true,
            },
          ],
        },
      ],
    },
  },
} as const;

export function previewLang(locale: string): Lang {
  return locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";
}

/* Frase de seguridad en reviewMode de Plans: referencia a norma, no certificación (copy aprobado: "no son sellos"). */
export const REVIEW_SECURITY_ITEM: Record<Lang, string> = {
  es: "Roles y permisos configurados; referencia a BASC e ISO 28000 (no es certificación)",
  en: "Roles and permissions configured; reference to BASC and ISO 28000 (not a certification)",
  pt: "Papéis e permissões configurados; referência a BASC e ISO 28000 (não é certificação)",
};

/* Tarjeta de trazabilidad multimodal del Hero (datos demostrativos, rotulados). Borradores EN/PT. */
export const PREVIEW_TRACK: Record<
  Lang,
  {
    kicker: string;
    note: string;
    status: string;
    eta: string;
    route: [string, string, string];
    mode: string;
  }
> = {
  es: {
    kicker: "Trazabilidad multimodal",
    note: "Datos demostrativos · no son operaciones reales",
    status: "En escala",
    eta: "ETA 18 nov",
    route: ["Shanghái", "Panamá", "Colombia"],
    mode: "Marítimo",
  },
  en: {
    kicker: "Multimodal traceability",
    note: "Demo data · not real operations",
    status: "Transshipment",
    eta: "ETA 18 Nov",
    route: ["Shanghai", "Panama", "Colombia"],
    mode: "Sea",
  },
  pt: {
    kicker: "Rastreabilidade multimodal",
    note: "Dados demonstrativos · não são operações reais",
    status: "Em escala",
    eta: "ETA 18 nov",
    route: ["Xangai", "Panamá", "Colômbia"],
    mode: "Marítimo",
  },
};

/* Trazabilidad multimodal (sección propia). Datos demostrativos: nunca se presentan como seguimiento real. */
export const PREVIEW_MULTIMODAL: Record<
  Lang,
  {
    kicker: string;
    note: string;
    eta: string;
    status: Record<"transit" | "stop" | "control", string>;
    shipments: ReadonlyArray<{
      mode: "sea" | "air" | "road";
      modeLabel: string;
      route: ReadonlyArray<string>;
      status: "transit" | "stop" | "control";
      eta: string;
      progress: number;
    }>;
  }
> = {
  es: {
    kicker: "Trazabilidad multimodal",
    note: "Datos demostrativos · no son operaciones reales",
    eta: "ETA",
    status: { transit: "En tránsito", stop: "En escala", control: "Control documental" },
    shipments: [
      {
        mode: "sea",
        modeLabel: "Marítimo",
        route: ["Hamburgo", "Cartagena"],
        status: "stop",
        eta: "18 nov",
        progress: 0.6,
      },
      {
        mode: "air",
        modeLabel: "Aéreo",
        route: ["Valencia", "Bogotá"],
        status: "transit",
        eta: "21 nov",
        progress: 0.4,
      },
      {
        mode: "road",
        modeLabel: "Terrestre",
        route: ["Miami", "Caracas"],
        status: "control",
        eta: "14 nov",
        progress: 0.9,
      },
    ],
  },
  en: {
    kicker: "Multimodal traceability",
    note: "Demo data · not real operations",
    eta: "ETA",
    status: { transit: "In transit", stop: "Transshipment", control: "Document control" },
    shipments: [
      {
        mode: "sea",
        modeLabel: "Sea",
        route: ["Hamburg", "Cartagena"],
        status: "stop",
        eta: "18 Nov",
        progress: 0.6,
      },
      {
        mode: "air",
        modeLabel: "Air",
        route: ["Valencia", "Bogotá"],
        status: "transit",
        eta: "21 Nov",
        progress: 0.4,
      },
      {
        mode: "road",
        modeLabel: "Road",
        route: ["Miami", "Caracas"],
        status: "control",
        eta: "14 Nov",
        progress: 0.9,
      },
    ],
  },
  pt: {
    kicker: "Rastreabilidade multimodal",
    note: "Dados demonstrativos · não são operações reais",
    eta: "ETA",
    status: { transit: "Em trânsito", stop: "Em escala", control: "Controle documental" },
    shipments: [
      {
        mode: "sea",
        modeLabel: "Marítimo",
        route: ["Hamburgo", "Cartagena"],
        status: "stop",
        eta: "18 nov",
        progress: 0.6,
      },
      {
        mode: "air",
        modeLabel: "Aéreo",
        route: ["Valência", "Bogotá"],
        status: "transit",
        eta: "21 nov",
        progress: 0.4,
      },
      {
        mode: "road",
        modeLabel: "Rodoviário",
        route: ["Miami", "Caracas"],
        status: "control",
        eta: "14 nov",
        progress: 0.9,
      },
    ],
  },
};

/* The Platform: etiquetas de las visualizaciones conceptuales (no son capturas). */
export const PREVIEW_CONCEPT: Record<
  Lang,
  { label: string; scatter: ReadonlyArray<string>; nodes: ReadonlyArray<string>; hub: string }
> = {
  es: {
    label: "Ilustración conceptual · no es una captura",
    scatter: [
      "Hojas de cálculo",
      "Correos",
      "Cotización sin seguimiento",
      "HBL / HAWB",
      "Mensajes de WhatsApp",
    ],
    nodes: ["Cliente", "Cotización", "Operación", "Documentos"],
    hub: "Una sola fuente",
  },
  en: {
    label: "Conceptual illustration · not a screenshot",
    scatter: ["Spreadsheets", "Emails", "Untracked quote", "HBL / HAWB", "WhatsApp messages"],
    nodes: ["Client", "Quote", "Operation", "Documents"],
    hub: "One source",
  },
  pt: {
    label: "Ilustração conceitual · não é uma captura",
    scatter: [
      "Planilhas",
      "E-mails",
      "Cotação sem acompanhamento",
      "HBL / HAWB",
      "Mensagens de WhatsApp",
    ],
    nodes: ["Cliente", "Cotação", "Operação", "Documentos"],
    hub: "Uma única fonte",
  },
};
