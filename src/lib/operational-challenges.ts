import type { Locale } from "@/lib/i18n";

type ChallengeContent = {
  kicker: string;
  title: string;
  challenges: Array<{ title: string; before: string; emphasis?: string; after?: string; alt: string }>;
};

export const operationalChallenges: Record<Locale, ChallengeContent> = {
  es: {
    kicker: "EL COSTO DE UNA OPERACIÓN FRAGMENTADA",
    title: "Hoy, los agentes de carga enfrentan desafíos que las soluciones de software tradicionales no han logrado resolver.",
    challenges: [
      { title: "Márgenes muy ajustados", before: "Operar con un margen neto de apenas ", emphasis: "3 % a 5 %", after: " incrementa la presión financiera y el riesgo de cada operación.", alt: "Profesional analizando costos y documentación financiera de una operación." },
      { title: "Competencia feroz", before: "Sin una diferenciación clara, competir únicamente por precio reduce la rentabilidad y limita el crecimiento.", alt: "Equipo comercial comparando documentos y propuestas alrededor de una mesa de trabajo." },
      { title: "Un modelo operativo que se vuelve obsoleto", before: "Los procesos manuales, la información fragmentada y las herramientas desconectadas ya no responden a las exigencias actuales del negocio.", alt: "Trabajo manual con documentos y archivos en papel dispersos sobre una mesa." },
    ],
  },
  en: {
    kicker: "THE COST OF A FRAGMENTED OPERATION",
    title: "Today, freight forwarders face challenges that traditional software solutions have not been able to resolve.",
    challenges: [
      { title: "Very tight margins", before: "Operating with a net margin of just ", emphasis: "3% to 5%", after: " increases financial pressure and the risk of every operation.", alt: "Professional analyzing costs and financial documents for an operation." },
      { title: "Fierce competition", before: "Without clear differentiation, competing solely on price reduces profitability and limits growth.", alt: "Commercial team comparing documents and proposals around a work table." },
      { title: "An operating model becoming obsolete", before: "Manual processes, fragmented information and disconnected tools no longer meet today's business demands.", alt: "Manual work with scattered paper documents and files on a desk." },
    ],
  },
  "pt-BR": {
    kicker: "O CUSTO DE UMA OPERAÇÃO FRAGMENTADA",
    title: "Hoje, os agentes de carga enfrentam desafios que as soluções de software tradicionais não conseguiram resolver.",
    challenges: [
      { title: "Margens muito apertadas", before: "Operar com uma margem líquida de apenas ", emphasis: "3 % a 5 %", after: " aumenta a pressão financeira e o risco de cada operação.", alt: "Profissional analisando custos e documentos financeiros de uma operação." },
      { title: "Concorrência acirrada", before: "Sem uma diferenciação clara, competir apenas por preço reduz a rentabilidade e limita o crescimento.", alt: "Equipe comercial comparando documentos e propostas ao redor de uma mesa de trabalho." },
      { title: "Um modelo operacional que se torna obsoleto", before: "Os processos manuais, as informações fragmentadas e as ferramentas desconectadas já não atendem às exigências atuais do negócio.", alt: "Trabalho manual com documentos e arquivos em papel espalhados sobre uma mesa." },
    ],
  },
};