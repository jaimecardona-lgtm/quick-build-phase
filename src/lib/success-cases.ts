/*
 * Casos de cliente compartidos por las dos presentaciones de la Home (La logística, en la voz de quienes la viven;
 * y Descubre cómo otros líderes…). Textos literales de los testimonios autorizados en Framer. No inventar ni parafrasear.
 * Fotografías y logos: restaurados por instrucción del propietario; pendiente documentar autorización de distribución.
 */
export const CASE_VIDEO_ID = "V39UQwu2THo";

export type CaseItem = {
  tab: string;
  logoName: string;
  logoId: string;
  logo: string;
  photo: string;
  person: string;
  meta: string;
  title: string;
  quote: string;
  /** Extracto literal y breve del testimonio (frase completa del mismo texto). */
  excerpt: string;
  /** Resultado medible aportado por el cliente (texto tal cual se autorizó). */
  result: string;
};


export const CASES: readonly CaseItem[] = [
  {
    tab: "R&R Logistics CFS",
    logoName: "R&R Logistics CFS",
    logoId: "rr-logistics",
    logo: "/cases/logos/rr-logistics-cfs.png",
    photo: "/cases/diana-moncayo.png",
    person: "Diana Moncayo · Directora Comercial",
    meta: "R&R Logistics CFS / Miami",
    title: "Solución pensada para nuestra realidad",
    quote:
      "“Con Logixtic® logramos centralizar toda nuestra operación comercial, documental y logística en una sola plataforma, sin aumentar personal ni complejidad operativa.”",
    excerpt:
      "Con Logixtic® logramos centralizar toda nuestra operación comercial, documental y logística en una sola plataforma, sin aumentar personal ni complejidad operativa.",
    result:
      "Más de 20 % de reducción de costos operativos y 35 % de mejora en tiempos de respuesta.",
  },
  {
    tab: "Connecta Global",
    logoName: "Connecta Global",
    logoId: "connecta-global",
    logo: "/cases/logos/connecta-global.png",
    photo: "/cases/carlos-sanchez.png",
    person: "Carlos Sánchez · Controller",
    meta: "Connecta Global / Panamá",
    title: "Adiós al caos de correos",
    quote:
      "“Con el portal de clientes de Logixtic® transformamos por completo la comunicación con nuestros clientes y la visibilidad de cada operación.”",
    excerpt:
      "Con el portal de clientes de Logixtic® transformamos por completo la comunicación con nuestros clientes y la visibilidad de cada operación.",
    result:
      "Más de 40 % de reducción del seguimiento manual de sus operaciones.",
  },
  {
    tab: "Trade & Business SAS",
    logoName: "Trade & Business SAS",
    logoId: "trade-business",
    logo: "/cases/logos/trade-business-sas.png",
    photo: "/cases/dayana-ordonez.png",
    person: "Dayana Ordóñez · CEO",
    meta: "Trade & Business SAS / Colombia",
    title: "Centralización que transforma",
    quote:
      "“Antes de Logixtic®, nuestra operación era un caos de correos, llamadas y hojas de Excel. Hoy tenemos todo centralizado, los estatus se actualizan solos y el cliente siempre sabe en qué va su carga. Ahorramos tiempo y eliminamos errores que antes eran parte del día a día.”",
    excerpt:
      "Antes de Logixtic®, nuestra operación era un caos de correos, llamadas y hojas de Excel.",
    result:
      "Centralización de la operación comercial, operativa y documental en un mismo sistema.",
  },
];

