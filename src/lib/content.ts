/**
 * Contenido editable del Home Logixtic.
 * Textos, etapas, casos y preguntas centralizados para facilitar la edición.
 */

export const DEMO_LABEL = "Agenda una demo personalizada";

export const nav = [
  { label: "Plataforma", href: "#plataforma" },
  { label: "Logix AI", href: "#logix-ai" },
  { label: "Clientes", href: "#clientes" },
  { label: "Implementación", href: "#implementacion" },
] as const;

export const resourceLinks = [
  { label: "Blog", href: "https://logixtic.co/blog-logixtic/", description: "Artículos y tendencias", available: true },
  { label: "Guías", href: "", description: "Ruta pendiente", available: false },
  { label: "Webinars", href: "", description: "Ruta pendiente", available: false },
  { label: "Glosario", href: "", description: "Ruta pendiente", available: false },
] as const;

export const companyLink = { label: "Nosotros", href: "", available: false } as const;

export const hero = {
  eyebrow: "Software para Agentes de Carga Internacional",
  title: ["Toda tu operación logística,", "en un solo sistema."],
  body: "Logixtic® conecta la gestión comercial, operativa, documental y de clientes en una sola plataforma, con automatización e inteligencia artificial aplicada a la operación.",
  secondaryCta: "Conoce la plataforma",
  image: "/assets/01-plataforma-servicios-menu.webp",
  imageAlt:
    "Pantalla real de Logixtic con el menú de servicios de la plataforma de gestión de carga.",
};

export const problem = {
  title: "Tu operación pierde tiempo cuando la información está dispersa.",
  body: "Excel, correos, mensajes, llamadas y documentos separados obligan al equipo a buscar, duplicar y confirmar información antes de avanzar.",
  sources: [
    { label: "Hojas de cálculo", icon: "sheet" },
    { label: "Correo", icon: "mail" },
    { label: "Mensajería", icon: "message" },
    { label: "Llamadas", icon: "phone" },
    { label: "Documentos", icon: "doc" },
  ],
  outcome: "Toda tu operación, en un solo lugar.",
} as const;

export const transformation = {
  title: "Una forma más inteligente de operar.",
  body: "La información deja de pasar entre herramientas aisladas y acompaña cada etapa de la operación.",
  before: [
    "Información dispersa",
    "Procesos manuales y reprocesos",
    "Poca visibilidad",
    "Decisiones tardías",
  ],
  after: [
    "Información centralizada",
    "Procesos conectados",
    "Trazabilidad e indicadores",
    "Mayor control sobre la operación",
  ],
  moments: ["Centraliza", "Automatiza", "Decide"],
  image: "/assets/06-costos-operacion.webp",
  imageAlt: "Pantalla real de Logixtic con el control de costos de una operación.",
};

export type FlowStage = {
  label: string;
  body: string;
  image?: string;
  alt?: string;
};

export const flow: { title: string; body: string; stages: FlowStage[] } = {
  title: "Así fluye una operación.",
  body: "La información se registra una vez y acompaña cada etapa, sin volver a capturarse.",
  stages: [
    {
      label: "Prospecto",
      body: "La oportunidad queda registrada con empresa, responsable y actividad.",
      image: "/assets/02-gestion-comercial-resumen.webp",
      alt: "Resumen comercial de un prospecto en Logixtic.",
    },
    {
      label: "Cotización",
      body: "La propuesta se construye sobre la información comercial ya registrada.",
      image: "/assets/06-costos-operacion.webp",
      alt: "Costos por servicio de una operación en Logixtic.",
    },
    {
      label: "Vinculación",
      body: "El prospecto se convierte en cliente conservando su historial.",
      image: "/assets/03-gestion-comercial-timeline.webp",
      alt: "Historial de actividad comercial fechado en Logixtic.",
    },
    {
      label: "Operación",
      body: "La operación avanza por pasos con responsables y fechas visibles.",
      image: "/assets/04-seguimiento-operativo-pasos.webp",
      alt: "Seguimiento por pasos de una operación en Logixtic.",
    },
    {
      label: "Documentación",
      body: "Los soportes quedan asociados al cliente y a la operación.",
      image: "/assets/08-gestion-documental.webp",
      alt: "Gestión documental de un cliente en Logixtic.",
    },
    {
      label: "Trazabilidad",
      body: "El checklist muestra qué está hecho y qué falta en cada operación.",
      image: "/assets/05-seguimiento-operativo-tareas.webp",
      alt: "Checklist de tareas de una operación en Logixtic.",
    },
    {
      label: "Portal",
      body: "El cliente consulta el estado de sus operaciones y sus documentos.",
    },
    {
      label: "Indicadores",
      body: "Costos presupuestados, costos reales y margen se consultan en la operación.",
      image: "/assets/07-rentabilidad-margen.webp",
      alt: "Margen presupuestado y margen real de una operación en Logixtic.",
    },
  ],
};

export const logix = {
  title: "Pregúntale a Logix sobre tu operación.",
  body: "Logix consulta la información disponible en Logixtic® para agilizar búsquedas de clientes, prospectos, DO's, pedidos, operaciones y datos relacionados, respetando los permisos de cada usuario.",
  exampleTitle: "Consulta operativa",
  query: "¿Dónde está el pedido 4587?",
  answer: "Logix consulta la información registrada según los permisos del usuario.",
  answerItems: [
    "Pedido 4587",
    "Estado disponible en la operación",
    "Operación relacionada",
    "Documentos disponibles para ese usuario",
  ],
  actions: ["Ver operación", "Consultar documentos", "Información del cliente"],
};

export const portal = {
  title: "Tus clientes también avanzan contigo.",
  body: "El Portal de Clientes centraliza la consulta de operaciones, trazabilidad, documentos, historial y comunicación disponible para cada cliente.",
  diagram: ["Equipo operativo", "Logixtic®", "Cliente"],
  benefits: [
    "Visibilidad de operaciones",
    "Trazabilidad",
    "Acceso a documentos",
    "Historial",
  ],
};

export const evidence = {
  title: "Empresas que ya conectan su operación con Logixtic",
  body: "Agentes de carga que gestionan su operación desde una sola plataforma.",
  companies: ["R&R Logistics CFS", "Connecta Global", "Trade & Business SAS"],
  metrics: [
    { value: "17.543", label: "operaciones globales gestionadas" },
    { value: "699", label: "agentes de carga han probado la plataforma" },
    {
      value: "Colombia, Panamá y Estados Unidos (Florida)",
      label: "presencia actual de Logixtic®",
    },
  ],
  cases: [
    {
      company: "R&R Logistics CFS",
      result:
        "Más de 20 % de reducción de costos operativos y 35 % de mejora en tiempos de respuesta al conectar su operación en una sola plataforma.",
    },
    {
      company: "Connecta Global",
      result: "Más de 40 % de reducción del seguimiento manual de sus operaciones.",
    },
    {
      company: "Trade & Business SAS",
      result:
        "Centralización de la operación comercial, operativa y documental en un mismo sistema.",
    },
  ],
};

export const implementation = {
  title: "Te acompañamos desde la configuración hasta la operación real.",
  body: "Un proceso de adopción por etapas; la duración depende del alcance de cada operación.",
  steps: [
    { label: "Levantamiento", body: "Conocemos tu operación y tu forma de trabajar." },
    { label: "Parametrización", body: "Configuramos el sistema según tu operación." },
    { label: "Capacitación", body: "Entrenamos a tu equipo en el uso de la plataforma." },
    { label: "Pruebas", body: "Validamos el proceso completo antes de la salida." },
    { label: "Salida", body: "Ponemos el sistema en marcha con tu equipo." },
    { label: "Acompañamiento", body: "Seguimos contigo después de la puesta en marcha." },
  ],
};

export const faqs = [
  {
    q: "¿Qué es Logixtic® y cómo ayuda a los agentes de carga internacional?",
    a: "Logixtic® es software para agentes de carga internacional: una plataforma de gestión e inteligencia operativa que conecta la gestión comercial, operativa, documental y de clientes en un solo sistema, para que la información se registre una vez y acompañe toda la operación.",
  },
  {
    q: "¿Para qué tipo de Freight Forwarders está diseñado Logixtic®?",
    a: "Está diseñado para agentes de carga internacional y freight forwarders que gestionan operaciones de comercio internacional con equipos comerciales, operativos y documentales trabajando sobre las mismas operaciones.",
  },
  {
    q: "¿Qué problemas operativos ayuda a resolver Logixtic®?",
    a: "Resuelve la dispersión de la información. Evita que el equipo busque, duplique y confirme datos en hojas de cálculo, correos, mensajes y carpetas separadas antes de avanzar con una operación.",
  },
  {
    q: "¿En qué se diferencia Logixtic® de un sistema tradicional para agentes de carga?",
    a: "Conecta el proceso completo en una sola fuente de información, desde el prospecto hasta los indicadores de la operación, e incorpora consulta conversacional con Logix sobre la información ya registrada.",
  },
  {
    q: "¿Qué procesos puede centralizar Logixtic®?",
    a: "Centraliza la gestión comercial, la operación, la documentación, la trazabilidad, la consulta del cliente y los indicadores de costos y margen de cada operación.",
  },
  {
    q: "¿Cómo ayuda Logixtic® a reducir la dependencia de Excel, correos y procesos manuales?",
    a: "La información se registra una vez en la plataforma y queda disponible para las demás etapas, con tareas, documentos y responsables asociados a cada operación, en lugar de archivos y conversaciones separadas.",
  },
  {
    q: "¿Cómo funciona Logix y la inteligencia artificial en Logixtic®?",
    a: "Logix es una consulta conversacional sobre la información ya registrada en Logixtic®. Permite buscar clientes, prospectos, DO's, pedidos y operaciones respetando los permisos de cada usuario.",
  },
  {
    q: "¿Cómo ayuda Logixtic® a automatizar y mejorar la productividad?",
    a: "Al conectar las etapas de la operación, el equipo deja de repetir capturas y búsquedas de información. El avance queda visible en tareas y seguimiento, lo que reduce el trabajo manual de coordinación.",
  },
  {
    q: "¿Cómo funciona la gestión documental integrada?",
    a: "Cada documento queda asociado al cliente y a la operación correspondiente, con responsable y fecha, y puede consultarse desde el expediente del cliente o desde la operación.",
  },
  {
    q: "¿Qué información puede ver el cliente en el Portal de Clientes?",
    a: "El cliente consulta sus operaciones, su trazabilidad, los documentos disponibles para él, su historial y la comunicación habilitada por el agente de carga.",
  },
  {
    q: "¿Cómo se manejan los usuarios y permisos?",
    a: "El acceso a la información depende de los permisos de cada usuario. Logix y el Portal de Clientes muestran únicamente lo que ese usuario está autorizado a consultar.",
  },
  {
    q: "¿Logixtic® se adapta a diferentes tipos de operación y carga?",
    a: "Sí. La plataforma se parametriza durante la implementación según los servicios, procesos y tipos de operación de cada agente de carga.",
  },
  {
    q: "¿Cuánto tiempo toma implementar Logixtic®?",
    a: "La implementación tiene seis etapas: levantamiento, parametrización, capacitación, pruebas, salida y acompañamiento. La duración depende del alcance de la operación y se define con el equipo comercial.",
  },
  {
    q: "¿Qué planes ofrece Logixtic®?",
    a: "La propuesta depende del número de usuarios y del alcance de la operación. Se define en la demo personalizada, junto con el equipo de Logixtic®.",
  },
  {
    q: "¿Cómo puedo saber si Logixtic® es adecuado para mi operación?",
    a: "Agenda una demo personalizada: revisamos cómo trabaja tu equipo hoy y qué procesos podrían conectarse en la plataforma.",
  },
];

export const closing = {
  title: "Tu operación puede trabajar con más control, visibilidad e inteligencia.",
  body: "Conoce cómo Logixtic® puede conectar la información y los procesos de tu operación en una sola plataforma.",
  note: "Después de la demo y del análisis de la operación, podrá realizarse el Diagnóstico de Madurez Operativa y Digital cuando aplique.",
};
