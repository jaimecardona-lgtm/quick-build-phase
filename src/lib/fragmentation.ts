import type { Locale } from "@/lib/i18n";

type FragmentationContent = {
  kicker: string;
  title: string;
  body: string;
  steps: [string, string, string];
  cards: string[];
  control: string;
  benefits: string[];
  shotAlt: string;
};

export const fragmentation: Record<Locale, FragmentationContent> = {
  es: {
    kicker: "DE LA FRAGMENTACIÓN AL CONTROL",
    title: "Tu operación pierde tiempo y dinero cuando la información está dispersa.",
    body: "Hojas de cálculo, documentos y procesos separados obligan al equipo a buscar, duplicar y confirmar información. Logixtic conecta toda la operación en un solo lugar.",
    steps: ["Información dispersa", "Conexión", "Control"],
    cards: ["Hojas de cálculo desactualizadas", "Documentación", "Vinculación de clientes", "Cotizaciones y seguimiento", "HBL, HAWB y certificados", "DO y expedientes de carga", "Trazabilidad y estados", "Liquidación de embarques"],
    control: "Toda tu operación, en un solo lugar.",
    benefits: ["Información centralizada", "Procesos conectados", "Trazabilidad e indicadores", "Mayor control y rentabilidad"],
    shotAlt: "Captura real de Logixtic con el análisis de rentabilidad y margen de una operación.",
  },
  en: {
    kicker: "FROM FRAGMENTATION TO CONTROL",
    title: "Your operation loses time and money when information is scattered.",
    body: "Spreadsheets, documents and separate processes force the team to search for, duplicate and confirm information. Logixtic connects the entire operation in one place.",
    steps: ["Scattered information", "Connection", "Control"],
    cards: ["Outdated spreadsheets", "Documentation", "Customer onboarding", "Quotes and follow-up", "HBL, HAWB and certificates", "DOs and cargo files", "Traceability and statuses", "Shipment settlement"],
    control: "Your entire operation, in one place.",
    benefits: ["Centralized information", "Connected processes", "Traceability and KPIs", "Greater control and profitability"],
    shotAlt: "Real Logixtic screenshot showing the profitability and margin analysis of an operation.",
  },
  "pt-BR": {
    kicker: "DA FRAGMENTAÇÃO AO CONTROLE",
    title: "Sua operação perde tempo e dinheiro quando a informação está dispersa.",
    body: "Planilhas, documentos e processos separados obrigam a equipe a buscar, duplicar e confirmar informações. A Logixtic conecta toda a operação em um só lugar.",
    steps: ["Informação dispersa", "Conexão", "Controle"],
    cards: ["Planilhas desatualizadas", "Documentação", "Vinculação de clientes", "Cotações e acompanhamento", "HBL, HAWB e certificados", "DO e processos de carga", "Rastreabilidade e status", "Liquidação de embarques"],
    control: "Toda a sua operação, em um só lugar.",
    benefits: ["Informação centralizada", "Processos conectados", "Rastreabilidade e indicadores", "Mais controle e rentabilidade"],
    shotAlt: "Captura real da Logixtic com a análise de rentabilidade e margem de uma operação.",
  },
};
