import type { Locale } from "@/lib/i18n";

type ChallengeContent = {
  kicker: string;
  title: string;
  challenges: Array<{ title: string; body: string }>;
};

export const operationalChallenges: Record<Locale, ChallengeContent> = {
  es: {
    kicker: "EL COSTO DE UNA OPERACIÓN FRAGMENTADA",
    title: "La información dispersa limita el control y la capacidad de crecer.",
    challenges: [
      { title: "Márgenes bajo presión", body: "Los reprocesos y la falta de visibilidad sobre los costos dificultan proteger la rentabilidad de cada embarque." },
      { title: "Competencia por precio", body: "Sin una propuesta de servicio diferenciada, el precio termina pesando más en la decisión del cliente." },
      { title: "Procesos que limitan el crecimiento", body: "Depender de hojas de cálculo y tareas manuales dificulta atender más operaciones con el mismo equipo." },
    ],
  },
  en: {
    kicker: "THE COST OF A FRAGMENTED OPERATION",
    title: "Scattered information limits control and the ability to grow.",
    challenges: [
      { title: "Margins under pressure", body: "Rework and a lack of visibility over costs make it harder to protect the profitability of every shipment." },
      { title: "Price-driven competition", body: "Without a differentiated service offering, price ends up weighing more in the customer's decision." },
      { title: "Processes that limit growth", body: "Relying on spreadsheets and manual tasks makes it harder to handle more operations with the same team." },
    ],
  },
  "pt-BR": {
    kicker: "O CUSTO DE UMA OPERAÇÃO FRAGMENTADA",
    title: "A informação dispersa limita o controle e a capacidade de crescer.",
    challenges: [
      { title: "Margens sob pressão", body: "Os retrabalhos e a falta de visibilidade sobre os custos dificultam proteger a rentabilidade de cada embarque." },
      { title: "Concorrência por preço", body: "Sem uma proposta de serviço diferenciada, o preço acaba pesando mais na decisão do cliente." },
      { title: "Processos que limitam o crescimento", body: "Depender de planilhas e tarefas manuais dificulta atender mais operações com a mesma equipe." },
    ],
  },
};
