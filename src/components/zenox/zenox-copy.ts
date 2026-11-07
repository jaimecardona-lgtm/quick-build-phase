/**
 * Copy aprobado para la variante Zenox de la home (ES). Fuente: "Logixtic® — Copy y SEO del sitio web (v1)".
 * Reglas: solo texto aprobado. Lo marcado [VALIDAR] en el documento NO aparece aquí hasta su aprobación:
 * cifras y contadores, logos y testimonios sin autorización, "Ahorra hasta 15 %", soporte 24/7,
 * "Somos auditores internos ISO 27001" y el caso R&R con cifras.
 */

export const ZX_META = {
  title: "Software para Agentes de Carga con IA | Logixtic®",
  description:
    "Software para agentes de carga y Freight Forwarders impulsado por IA. Conecta CRM, operaciones, documentos y margen por embarque en LATAM.",
  canonical: "https://www.logixtic.co/",
} as const;

/* Bloque editorial lateral del Hero (igual que en Framer, Desktop). */
export const ZX_HERO_BLOCK = {
  tag: "Logixtic® · Sistema Operativo",
  title: "UNA SOLA OPERACIÓN. TODO CONECTADO.",
  pillars: [
    { h: "Gestión comercial", p: "Cotizaciones, clientes y seguimiento en un solo flujo." },
    { h: "Control operativo", p: "Embarques, documentos y estatus visibles para tu equipo." },
    { h: "Rentabilidad", p: "Margen por operación, con datos de cada embarque." },
  ],
} as const;

export const ZX_HERO = {
  eyebrow: "Software para Freight Forwarders en Latinoamérica",
  h1: "Software para agentes de carga impulsado por IA",
  sub:
    "Logixtic® es el Sistema Operativo que conecta tu gestión comercial, operativa, documental y financiera. Es el software para Freight Forwarders que permite a tu equipo operar más embarques, con más control y con el margen de cada operación a la vista.",
  support: "No necesitas otro software. Necesitas un Sistema Operativo.",
  ctaPrimary: "Agenda diagnóstico operativo",
  ctaSecondary: "Descubre dónde estás perdiendo margen",
  micro: "Exclusivo para agentes de carga (Freight Forwarders) de LATAM. El diagnóstico se hace con tus propios números.",
  deviceAlt: "Software para agentes de carga Logixtic® mostrando el margen de una operación",
} as const;

/* Navegación aprobada (copy v1, sección 3). "Recursos" enlaza al blog existente. */
export const ZX_NAV = [
  { label: "Software", href: "#software" },
  { label: "Logix (IA)", href: "#logix" },
  { label: "Clientes", href: "#clientes-logos" },
  { label: "Implementación", href: "#implementacion" },
  { label: "Planes", href: "#planes" },
  { label: "Recursos", href: "https://www.logixtic.co/blog-logixtic/" },
] as const;

export const ZX_ROI = { label: "Diagnóstico ROI" } as const;

/* Etiquetas de interfaz no incluidas en el copy aprobado. Pendientes de validación con Carlos Salazar. */
export const ZX_UI = {
  problem: "El problema",
  services: "Servicios",
  fragmentation: "De la fragmentación al control",
  faq: "Preguntas frecuentes",
  example: "Ejemplo ilustrativo",
  pending: "Pendiente de validación",
  watchLogix: "Preguntar a Logix",
  whatsapp: "WhatsApp",
  glassQuote: "Cotización registrada",
  glassDocs: "Documentos asociados",
  glassMargin: "Margen por operación",
} as const;

export const ZX_FOOTER = {
  tagline: "Software para agentes de carga impulsado por IA",
  privacy: { label: "Política de privacidad", href: "https://www.logixtic.co/politica-de-privacidad" },
  terms: { label: "Términos y condiciones", href: "https://www.logixtic.co/terminos-y-condiciones" },
  blog: { label: "Blog", href: "https://www.logixtic.co/blog-logixtic/" },
  email: { label: "info@logixtic.co", href: "mailto:info@logixtic.co" },
} as const;

export const ZX_ENTITY = {
  label: "Qué es Logixtic®",
  text:
    "Logixtic® es un software para agentes de carga (Freight Forwarders) impulsado por IA. Conecta CRM, cotizaciones, operaciones, documentos, trazabilidad y margen por embarque en un solo sistema, y está diseñado para agentes de carga internacional, NVOCC y operadores de comercio exterior en Latinoamérica.",
} as const;

export const ZX_PROBLEM = {
  h2: "Tu negocio no debería crecer al mismo ritmo que crece el caos operativo",
  items: [
    { h3: "Márgenes bajo presión", p: "Los reprocesos y la falta de visibilidad de costos hacen difícil saber cuánto dejó realmente cada embarque." },
    { h3: "Competir solo por precio", p: "Sin un servicio diferenciado y visible para tu cliente, la tarifa termina decidiendo." },
    { h3: "Un equipo que no da abasto", p: "Con Excel, correos y WhatsApp, atender más operaciones exige sumar personas al mismo ritmo." },
  ],
} as const;

export const ZX_TRANSITION = {
  h2: "De Excel, correos y WhatsApp a una sola fuente de información",
  p:
    "Cuando cotizaciones, DO, documentos y estados viven en lugares distintos, tu equipo busca, duplica y confirma. Logixtic® registra la información una vez y la conecta con cada etapa de la operación.",
  steps: [
    { h3: "Información dispersa", p: "Hojas de cálculo desactualizadas, documentos sueltos, cotizaciones sin seguimiento, HBL, HAWB y certificados en carpetas distintas." },
    { h3: "Conexión", p: "Cliente, cotización, operación y documentos quedan vinculados." },
    { h3: "Control", p: "Trazabilidad, indicadores y margen por operación en un solo lugar." },
  ],
} as const;

export const ZX_PLATFORM = {
  label: "De información dispersa a control",
  h2: "El software para agentes de carga que cubre toda tu operación, del prospecto a la liquidación",
  capabilities: [
    { h3: "CRM para agentes de carga", p: "Cada oportunidad queda registrada con empresa, responsable y actividad." },
    { h3: "Cotizaciones y tarifas", p: "La propuesta se construye sobre información comercial ya registrada." },
    { h3: "Vinculación de clientes", p: "El prospecto se convierte en cliente conservando su historial." },
    { h3: "Operaciones y DO", p: "Cada operación avanza por pasos, con responsables y fechas visibles." },
    { h3: "Gestión documental", p: "HBL, HAWB, certificados y soportes asociados al cliente y a la operación." },
    { h3: "Trazabilidad", p: "Un checklist que muestra qué está hecho y qué falta en cada embarque." },
    { h3: "Margen por operación", p: "Costos presupuestados, costos reales y margen consultables en la propia operación." },
    { h3: "Portal de clientes", p: "Tus clientes consultan cotizaciones, operaciones, documentos y seguimiento sin escribirte." },
  ],
} as const;

export const ZX_SYSTEM = {
  h2: "Qué es un Sistema Operativo para Freight Forwarders",
  p:
    "Un Sistema Operativo para Freight Forwarders es un software que unifica en una sola fuente de información la gestión comercial, la operación, los documentos y las finanzas del agente de carga, en lugar de usar herramientas separadas. Logixtic® es ese sistema, con IA aplicada a la consulta y a las tareas repetitivas.",
  card: [
    ["Categoría", "Software para agentes de carga / Freight Forwarding Software"],
    ["Para quién", "Agentes de carga internacional, NVOCC y operadores de comercio exterior en LATAM"],
    ["Qué conecta", "CRM, cotizaciones y tarifas, operaciones y DO, documentos, trazabilidad, margen por operación y portal de clientes"],
    ["IA", "Logix, consulta conversacional sobre el contenido aprobado de Logixtic"],
    ["Cumplimiento", "Roles y permisos alineados con BASC e ISO 28000 (referencia a la norma, no certificación)"],
    ["Implementación", "6 etapas; duración según alcance"],
    ["Planes", "Standard, Enterprise, Custom y pago único de implementación"],
    ["Presencia", "Ecuador, Colombia, Panamá y Miami"],
    ["Lanzamiento del MVP", "2024"],
  ] as ReadonlyArray<readonly [string, string]>,
} as const;

export const ZX_RESULTS = {
  h2: "Más control por embarque. Más capacidad para crecer.",
  p: "Reduce tareas manuales, recupera tiempo y controla el margen de cada embarque, de la cotización a la liquidación.",
  indicators: [
    { label: "Trazabilidad por etapa", note: "Qué está hecho y qué falta en cada embarque." },
    { label: "Margen por operación", note: "Costo presupuestado frente a costo real." },
    { label: "Información registrada una vez", note: "Cliente, cotización, operación y documentos vinculados." },
  ],
  disclaimer: "Las cifras de impacto se publicarán cuando estén validadas, con su periodo, su fuente y la aclaración de que dependen de cada operación.",
} as const;

export const ZX_LOGIX = {
  h2: "Logix, tu copiloto inteligente para la logística.",
  p: "Conecta tecnología, información y decisiones para llevar tu operación de carga al siguiente nivel.",
  buttonLabel: "Conversa con Logix",
  copilots: [
    { h3: "Copilotos comercial y operativo", p: "Inteligencia para optimizar procesos comerciales, seguimiento y gestión logística." },
    { h3: "Trazabilidad y rentabilidad", p: "Mayor visibilidad de tus operaciones y control de la información que impulsa tu negocio." },
  ],
} as const;

export const ZX_IMPLEMENTATION = {
  h2: "Implementación del software para agentes de carga en 6 etapas, con tu equipo acompañado",
  stages: ["Levantamiento", "Parametrización", "Capacitación", "Pruebas", "Salida", "Acompañamiento"],
  note: "La duración depende del alcance de cada operación.",
} as const;

export const ZX_PLANS = {
  h2: "Planes del software para Freight Forwarders",
  p: "Control real de la operación, trazabilidad de cada proceso, visibilidad del margen por operación y una mejor experiencia para tus clientes.",
  tiers: [
    {
      id: "standard",
      name: "Standard",
      for: "Para agentes que inician su transformación digital.",
      items: [
        "Todas las funcionalidades de Logixtic®",
        "PDF Maker Basic",
        "Automatizaciones básicas",
        "2 h de capacitación por módulo",
        "De 3 a 9 usuarios",
        "Soporte técnico",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      for: "Para agentes en crecimiento y expansión.",
      items: [
        "Todas las funcionalidades de Logixtic®",
        "PDF Maker Professional",
        "Automatizaciones ilimitadas por módulo",
        "4 h de capacitación por módulo",
        "10 o más usuarios",
      ],
    },
    {
      id: "custom",
      name: "Custom",
      for: "Para operaciones con necesidades específicas.",
      items: [
        "Auditoría de diseño técnico",
        "Integraciones por API",
        "Funcionalidades a la medida, según propuesta",
      ],
    },
  ],
  setup: {
    name: "Setup Fee (pago único)",
    items: [
      "Onboarding",
      "Personalización de flujos y documentos",
      "Migración básica de datos",
      "Capacitación, pruebas y go-live",
      "Roles de usuario",
    ],
  },
  priceNote: "El precio depende del número de usuarios y del alcance. Agenda diagnóstico operativo y lo calculamos con tu operación.",
} as const;

export const ZX_COMPLIANCE = {
  h2: "Cumplimiento, trazabilidad y control documental en cada operación",
  p: "Logixtic opera con los marcos de OEA, BASC, ISO 28000 y DIAN: roles y permisos por usuario, trazabilidad de cada embarque y documentos vinculados a su operación.",
  // Aclaración obligatoria para lectores de pantalla (AGENTS.md): referencia a la norma, no sello de certificación.
  disclaimer: "Referencia a normas y programas; no son sellos de certificación de Logixtic®.",
  logos: ["OEA", "BASC", "ISO 28000", "DIAN"],
} as const;

export const ZX_COVERAGE = {
  h2: "Software para agentes de carga en Ecuador, Colombia, Panamá y Miami",
  p: "Acompañamos a Freight Forwarders con operación en estos mercados.",
} as const;

export const ZX_SOCIAL = {
  h2: "Agentes de carga que ya operan con trazabilidad, control y rentabilidad",
  p: "Equipos comerciales, operativos y financieros de agentes de carga en LATAM trabajan sobre una sola fuente de información, desde la cotización hasta la liquidación.",
  pending: "Los casos de clientes se publicarán con autorización escrita de cada cliente.",
} as const;

export const ZX_CASES = {
  h2: "Cómo los Freight Forwarders de LATAM ganan capacidad operativa con Logixtic®",
  p: "Escucha a quienes ya operan sobre un solo sistema.",
  pending: "Historias de clientes en preparación, sujetas a autorización escrita.",
} as const;

export const ZX_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "¿Qué es un software para agentes de carga?",
    a: "Es el sistema que conecta la gestión comercial, la operación, los documentos y las finanzas de un agente de carga. Logixtic® es un software para agentes de carga impulsado por IA: la información se registra una vez y acompaña la operación completa.",
  },
  {
    q: "¿Qué debe incluir un software para Freight Forwarders?",
    a: "CRM, cotizaciones y tarifas, gestión de DO y documentos de embarque, trazabilidad, control de margen por operación y portal de clientes. Logixtic® integra todo en un solo sistema.",
  },
  {
    q: "¿En qué se diferencia Logixtic® de otro software para agentes de carga?",
    a: "No es un conjunto de módulos aislados ni un dashboard. Conecta el proceso completo, del prospecto a los indicadores de cada operación, y suma Logix, una IA que responde sobre tu información registrada.",
  },
  {
    q: "¿Cómo funciona la IA en Logixtic®?",
    a: "Logix consulta clientes, prospectos, DO, pedidos y operaciones respetando los permisos de cada usuario. Es una palanca para liberar tiempo del equipo y proteger el margen, no una función aislada.",
  },
  {
    q: "¿Para qué Freight Forwarders está diseñado?",
    a: "Para agentes de carga internacional, Freight Forwarders y operadores que gestionan comercio exterior con equipos comerciales, operativos y documentales sobre las mismas operaciones.",
  },
  {
    q: "¿Qué problemas resuelve?",
    a: "La dispersión de información: evita buscar, duplicar y confirmar datos en hojas de cálculo, correos, mensajes y carpetas separadas.",
  },
  {
    q: "¿Cómo reduce la dependencia de Excel, correos y WhatsApp?",
    a: "Cada dato se registra una vez y queda asociado a la operación, con tareas, documentos y responsables visibles.",
  },
  {
    q: "¿Cómo funciona la gestión documental?",
    a: "Cada documento queda asociado al cliente y a la operación, con responsable y fecha, y se consulta desde el expediente o desde la operación.",
  },
  {
    q: "¿Qué ve el cliente en el portal?",
    a: "Sus operaciones, trazabilidad, documentos disponibles para él, historial y la comunicación habilitada por el agente de carga.",
  },
  {
    q: "¿Cómo se manejan los usuarios y permisos?",
    a: "Cada usuario accede solo a lo que tiene autorizado, tanto en Logix como en el portal de clientes.",
  },
  {
    q: "¿Cuánto tarda la implementación?",
    a: "Sigue seis etapas y su duración depende del alcance de tu operación. Se define contigo en el diagnóstico.",
  },
  {
    q: "¿Cuánto cuesta el software para agentes de carga de Logixtic®?",
    a: "Depende del número de usuarios y del alcance. Hay planes Standard, Enterprise y Custom, más un pago único de implementación. Agenda diagnóstico operativo y lo calculamos con tu operación.",
  },
];

export const ZX_CLOSING = {
  label: "Final",
  h2: "Tu operación conectada. Tu margen visible.",
  p: "El diagnóstico operativo muestra, con tus propios números, cuánto te cuesta hoy la fricción de tu operación.",
  cta: "Agenda diagnóstico operativo",
} as const;
