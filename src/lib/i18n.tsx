import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as esContent from "@/lib/content";
import { operationalChallenges } from "@/lib/operational-challenges";

export type Locale = "es" | "en" | "pt-BR";
type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T extends readonly (infer U)[] ? readonly Widen<U>[] : T extends object ? { readonly [K in keyof T]: Widen<T[K]> } : T;

type Dictionary = Widen<{
  demoLabel: string;
  nav: Array<{ label: string; href: string }>;
  resourceLinks: Array<{ label: string; href: string; description: string; available: boolean }>;
  companyLink: { label: string; href: string; available: boolean };
  hero: typeof esContent.hero;
  problem: typeof esContent.problem;
  challenges: typeof operationalChallenges.es;
  transformation: typeof esContent.transformation;
  flow: typeof esContent.flow;
  logix: typeof esContent.logix;
  portal: typeof esContent.portal;
  evidence: typeof esContent.evidence;
  implementation: typeof esContent.implementation;
  faqs: Array<{ q: string; a: string }>;
  closing: typeof esContent.closing;
  ui: {
    problemKicker: string; transformationKicker: string; before: string; withLogixtic: string;
    flowKicker: string; flowProgress: string; logixKicker: string; logixSources: string; query: string;
    portalKicker: string; evidenceKicker: string; clientsTitle: string; clientsBody: string; clientsLabel: string; regionalPresence: string; mapLabel: string; successCases: string;
    implementationKicker: string; faqKicker: string; resourcesTitle: string; resources: string;
    closingKicker: string; siteNavigation: string; rights: string; privacy: string; terms: string;
    mainNavigation: string; mobileNavigation: string; navigationMenu: string; openMenu: string; closeMenu: string;
    home: string; pendingRoute: string; skipContent: string; language: string; headerCta: string;
    logixModules: readonly string[];
  };
}>;

const sharedImages = {
  hero: { image: esContent.hero.image },
  transformation: { image: esContent.transformation.image },
};

const es: Dictionary = {
  challenges: operationalChallenges.es,
  demoLabel: esContent.DEMO_LABEL,
  nav: [...esContent.nav], resourceLinks: [...esContent.resourceLinks], companyLink: esContent.companyLink,
  hero: esContent.hero, problem: esContent.problem, transformation: esContent.transformation, flow: esContent.flow,
  logix: esContent.logix, portal: esContent.portal, evidence: esContent.evidence,
  implementation: esContent.implementation, faqs: [...esContent.faqs], closing: esContent.closing,
  ui: {
    problemKicker: "El costo de una operación fragmentada", transformationKicker: "La transformación Logixtic®", before: "Antes", withLogixtic: "Con Logixtic®",
    flowKicker: "Así fluye una operación", flowProgress: "Progreso del recorrido operativo", logixKicker: "Logix aplicado", logixSources: "Fuentes que Logix puede consultar", query: "Consulta:",
    portalKicker: "Portal de Clientes", evidenceKicker: "Evidencia", clientsTitle: "Agentes de Carga que ya operan con Trazabilidad, Control y Rentabilidad.", clientsBody: "Nuestros clientes reducen tareas manuales, recuperan tiempo y rentabilizan cada embarque —desde la cotización hasta la liquidación final— con total control y visibilidad en un Sistema Operativo impulsado por IA.", clientsLabel: "Logos de clientes de Logixtic", regionalPresence: "Presencia regional", mapLabel: "Presencia de Logixtic en Colombia, Panamá y Florida", successCases: "Casos de éxito",
    implementationKicker: "Implementación y acompañamiento", faqKicker: "Preguntas frecuentes", resourcesTitle: "Recursos para seguir avanzando", resources: "Recursos",
    closingKicker: "Cierre y conversión", siteNavigation: "Navegación del sitio", rights: "Todos los derechos reservados.", privacy: "Política de privacidad", terms: "Términos y condiciones",
    mainNavigation: "Navegación principal", mobileNavigation: "Navegación móvil", navigationMenu: "Menú de navegación", openMenu: "Abrir menú", closeMenu: "Cerrar menú",
    home: "inicio", pendingRoute: "Ruta corporativa pendiente", skipContent: "Saltar al contenido principal", language: "Seleccionar idioma", headerCta: "Habla con un experto", logixModules: ["Clientes", "Prospectos", "DO", "Pedidos", "Operaciones", "Documentos"],
  },
};

const en: Dictionary = {
  challenges: operationalChallenges.en,
  demoLabel: "Book a personalized demo",
  nav: [{ label: "Platform", href: "#plataforma" }, { label: "Logix", href: "#logix-ai" }, { label: "Customers", href: "#clientes" }, { label: "Implementation", href: "#implementacion" }],
  resourceLinks: [
    { label: "Blog", href: "https://logixtic.co/blog-logixtic/", description: "Articles and trends", available: true },
    { label: "Guides", href: "", description: "Coming soon", available: false },
    { label: "Webinars", href: "", description: "Coming soon", available: false },
    { label: "Glossary", href: "", description: "Coming soon", available: false },
  ],
  companyLink: { label: "About us", href: "", available: false },
  hero: { eyebrow: "Exclusively for international freight forwarders in Latam.", title: ["You don't need another software.", "You need an AI-powered operating system."], body: "Logixtic® connects your entire operation, automates processes and helps you grow with greater control, productivity and profitability with the help of AI.", secondaryCta: "Explore the platform", ...sharedImages.hero, imageAlt: "Real Logixtic screen showing the freight management platform's services menu." },
  problem: { title: "Your operation loses time when information is scattered.", body: "Spreadsheets, emails, messages, calls and separate documents force the team to search, duplicate and confirm information before moving forward.", sources: [{ label: "Spreadsheets", icon: "sheet" }, { label: "Email", icon: "mail" }, { label: "Messaging", icon: "message" }, { label: "Calls", icon: "phone" }, { label: "Documents", icon: "doc" }], outcome: "Your entire operation, in one place." },
  transformation: { title: "A smarter way to operate.", body: "Information stops moving between isolated tools and follows every stage of the operation.", before: ["Scattered information", "Manual processes and rework", "Limited visibility", "Delayed decisions"], after: ["Centralized information", "Connected processes", "Traceability and indicators", "Greater operational control"], moments: ["Centralize", "Automate", "Decide"], ...sharedImages.transformation, imageAlt: "Real Logixtic screen showing cost control for an operation." },
  flow: { title: "How an operation flows.", body: "Information is entered once and follows every stage without being captured again.", stages: [
    { label: "Prospect", body: "The opportunity is recorded with company, owner and activity.", image: "/assets/02-gestion-comercial-resumen.webp", alt: "Commercial summary of a prospect in Logixtic." },
    { label: "Quotation", body: "The proposal is built on the commercial information already recorded.", image: "/assets/06-costos-operacion.webp", alt: "Service costs for an operation in Logixtic." },
    { label: "Onboarding", body: "The prospect becomes a customer while retaining its history.", image: "/assets/03-gestion-comercial-timeline.webp", alt: "Dated commercial activity history in Logixtic." },
    { label: "Operation", body: "The operation advances step by step with visible owners and dates.", image: "/assets/04-seguimiento-operativo-pasos.webp", alt: "Step-by-step tracking of an operation in Logixtic." },
    { label: "Documentation", body: "Supporting files remain linked to the customer and operation.", image: "/assets/08-gestion-documental.webp", alt: "Customer document management in Logixtic." },
    { label: "Traceability", body: "The checklist shows what is complete and what remains for each operation.", image: "/assets/05-seguimiento-operativo-tareas.webp", alt: "Task checklist for an operation in Logixtic." },
    { label: "Portal", body: "Share with each customer the available information on their operations, documents and follow-up." },
    { label: "Indicators", body: "Budgeted costs, actual costs and margin are available within the operation.", image: "/assets/07-rentabilidad-margen.webp", alt: "Budgeted and actual margin for an operation in Logixtic." },
  ] },
  logix: { title: "Ask Logix about your operation.", body: "Logix searches the information available in Logixtic® to speed up queries for customers, prospects, DOs, orders, operations and related data, while respecting each user's permissions.", exampleTitle: "Operational query", query: "Where is order 4587?", answer: "Logix searches the recorded information according to the user's permissions.", answerItems: ["Order 4587", "Status available in the operation", "Related operation", "Documents available to that user"], actions: ["View operation", "View documents", "Customer information"] },
  portal: { title: "Your customers move forward with you.", body: "The Customer Portal centralizes access to operations, traceability, documents, history and communication available to each customer.", diagram: ["Operations team", "Logixtic®", "Customer"], benefits: ["Operations visibility", "Traceability", "Document access", "History"] },
  evidence: { title: "Companies already connecting their operation with Logixtic", body: "Freight forwarders managing their operation from a single platform.", companies: [...esContent.evidence.companies], metrics: [{ value: "17,543", label: "global operations managed" }, { value: "699", label: "freight forwarders have tried the platform" }, { value: "Colombia, Panama and the United States (Florida)", label: "Logixtic® current presence" }], cases: [
    { company: "R&R Logistics CFS", result: "More than 20% lower operating costs and a 35% improvement in response times by connecting its operation in a single platform." },
    { company: "Connecta Global", result: "More than 40% less manual tracking of its operations." },
    { company: "Trade & Business SAS", result: "Commercial, operational and document management centralized in one system." },
  ] },
  implementation: { title: "We support you from setup to real-world operation.", body: "A staged adoption process; timing depends on the scope of each operation.", steps: [{ label: "Discovery", body: "We learn about your operation and how you work." }, { label: "Configuration", body: "We configure the system for your operation." }, { label: "Training", body: "We train your team to use the platform." }, { label: "Testing", body: "We validate the complete process before launch." }, { label: "Launch", body: "We put the system into operation with your team." }, { label: "Ongoing support", body: "We stay with you after go-live." }] },
  faqs: [
    { q: "What is Logixtic® and how does it help international freight forwarders?", a: "Logixtic® is software for international freight forwarders: an operational management and intelligence platform that connects commercial, operational, document and customer management in one system, so information is entered once and follows the entire operation." },
    { q: "What kind of freight forwarders is Logixtic® designed for?", a: "It is designed for international freight forwarders managing international trade operations with commercial, operational and document teams working on the same shipments." },
    { q: "What operational problems does Logixtic® help solve?", a: "It solves fragmented information. It prevents teams from searching, duplicating and confirming data in separate spreadsheets, emails, messages and folders before moving an operation forward." },
    { q: "How is Logixtic® different from a traditional freight forwarding system?", a: "It connects the complete process in a single source of information, from prospect to operational indicators, and adds conversational queries with Logix over the information already recorded." },
    { q: "Which processes can Logixtic® centralize?", a: "It centralizes commercial management, operations, documentation, traceability, customer access, and the cost and margin indicators for each operation." },
    { q: "How does Logixtic® reduce reliance on spreadsheets, email and manual processes?", a: "Information is entered once in the platform and remains available to other stages, with tasks, documents and owners linked to each operation instead of separate files and conversations." },
    { q: "How do Logix and artificial intelligence work in Logixtic®?", a: "Logix is a conversational query over information already recorded in Logixtic®. It can search customers, prospects, DOs, orders and operations while respecting each user's permissions." },
    { q: "How does Logixtic® improve automation and productivity?", a: "By connecting operational stages, the team stops repeating data entry and searches. Progress is visible in tasks and tracking, reducing manual coordination work." },
    { q: "How does integrated document management work?", a: "Each document is linked to the corresponding customer and operation, with an owner and date, and can be viewed from the customer file or the operation." },
    { q: "What information can customers see in the Customer Portal?", a: "Customers can view their operations, traceability, the documents available to them, their history and communication enabled by the freight forwarder." },
    { q: "How are users and permissions managed?", a: "Access to information depends on each user's permissions. Logix and the Customer Portal only show what that user is authorized to view." },
    { q: "Does Logixtic® adapt to different operations and cargo types?", a: "Yes. During implementation, the platform is configured around each freight forwarder's services, processes and operation types." },
    { q: "How long does it take to implement Logixtic®?", a: "Implementation has six stages: discovery, configuration, training, testing, launch and ongoing support. Timing depends on the operation's scope and is defined with the commercial team." },
    { q: "What plans does Logixtic® offer?", a: "The proposal depends on the number of users and the operation's scope. It is defined during the personalized demo with the Logixtic® team." },
    { q: "How can I tell whether Logixtic® is right for my operation?", a: "Book a personalized demo: we review how your team works today and which processes could be connected in the platform." },
  ],
  closing: { title: "Your operation can work with greater control, visibility and intelligence.", body: "See how Logixtic® can connect your operation's information and processes in a single platform.", note: "After the demo and operational review, an Operational and Digital Maturity Assessment may be performed when applicable." },
  ui: { problemKicker: "The cost of a fragmented operation", transformationKicker: "The Logixtic® transformation", before: "Before", withLogixtic: "With Logixtic®", flowKicker: "How an operation flows", flowProgress: "Operational journey progress", logixKicker: "Logix in action", logixSources: "Sources Logix can search", query: "Query:", portalKicker: "Customer Portal", evidenceKicker: "Evidence", clientsTitle: "Freight Forwarders already operating with Traceability, Control and Profitability.", clientsBody: "Our customers reduce manual tasks, recover time and make every shipment profitable —from quotation to final settlement— with full control and visibility in an AI-powered Operating System.", clientsLabel: "Logixtic customer logos", regionalPresence: "Regional presence", mapLabel: "Logixtic presence in Colombia, Panama and Florida", successCases: "Success stories", implementationKicker: "Implementation and support", faqKicker: "Frequently asked questions", resourcesTitle: "Resources to keep moving forward", resources: "Resources", closingKicker: "Closing and conversion", siteNavigation: "Site navigation", rights: "All rights reserved.", privacy: "Privacy policy", terms: "Terms and conditions", mainNavigation: "Main navigation", mobileNavigation: "Mobile navigation", navigationMenu: "Navigation menu", openMenu: "Open menu", closeMenu: "Close menu", home: "home", pendingRoute: "Company page coming soon", skipContent: "Skip to main content", language: "Select language", headerCta: "Talk to an expert", logixModules: ["Customers", "Prospects", "DO", "Orders", "Operations", "Documents"] },
};

const pt: Dictionary = {
  challenges: operationalChallenges["pt-BR"],
  demoLabel: "Agende uma demonstração personalizada",
  nav: [{ label: "Plataforma", href: "#plataforma" }, { label: "Logix", href: "#logix-ai" }, { label: "Clientes", href: "#clientes" }, { label: "Implementação", href: "#implementacion" }],
  resourceLinks: [{ label: "Blog", href: "https://logixtic.co/blog-logixtic/", description: "Artigos e tendências", available: true }, { label: "Guias", href: "", description: "Em breve", available: false }, { label: "Webinars", href: "", description: "Em breve", available: false }, { label: "Glossário", href: "", description: "Em breve", available: false }],
  companyLink: { label: "Sobre nós", href: "", available: false },
  hero: { eyebrow: "Exclusivo para agentes de carga internacional na Latam.", title: ["Você não precisa de outro software.", "Você precisa de um sistema operacional potencializado com IA."], body: "Logixtic® conecta toda a sua operação, automatiza processos e faz você crescer com mais controle, produtividade e rentabilidade com a ajuda da IA.", secondaryCta: "Conheça a plataforma", ...sharedImages.hero, imageAlt: "Tela real do Logixtic com o menu de serviços da plataforma de gestão de cargas." },
  problem: { title: "Sua operação perde tempo quando as informações estão dispersas.", body: "Planilhas, e-mails, mensagens, chamadas e documentos separados obrigam a equipe a buscar, duplicar e confirmar informações antes de avançar.", sources: [{ label: "Planilhas", icon: "sheet" }, { label: "E-mail", icon: "mail" }, { label: "Mensagens", icon: "message" }, { label: "Chamadas", icon: "phone" }, { label: "Documentos", icon: "doc" }], outcome: "Toda a sua operação, em um só lugar." },
  transformation: { title: "Uma forma mais inteligente de operar.", body: "As informações deixam de passar por ferramentas isoladas e acompanham cada etapa da operação.", before: ["Informações dispersas", "Processos manuais e retrabalho", "Pouca visibilidade", "Decisões tardias"], after: ["Informações centralizadas", "Processos conectados", "Rastreabilidade e indicadores", "Maior controle da operação"], moments: ["Centralize", "Automatize", "Decida"], ...sharedImages.transformation, imageAlt: "Tela real do Logixtic com o controle de custos de uma operação." },
  flow: { title: "Assim flui uma operação.", body: "As informações são registradas uma vez e acompanham cada etapa, sem nova digitação.", stages: [
    { label: "Prospect", body: "A oportunidade é registrada com empresa, responsável e atividade.", image: "/assets/02-gestion-comercial-resumen.webp", alt: "Resumo comercial de um prospect no Logixtic." }, { label: "Cotação", body: "A proposta é criada com base nas informações comerciais já registradas.", image: "/assets/06-costos-operacion.webp", alt: "Custos por serviço de uma operação no Logixtic." }, { label: "Vinculação", body: "O prospect se torna cliente preservando seu histórico.", image: "/assets/03-gestion-comercial-timeline.webp", alt: "Histórico datado de atividade comercial no Logixtic." }, { label: "Operação", body: "A operação avança por etapas, com responsáveis e datas visíveis.", image: "/assets/04-seguimiento-operativo-pasos.webp", alt: "Acompanhamento por etapas de uma operação no Logixtic." }, { label: "Documentação", body: "Os arquivos ficam associados ao cliente e à operação.", image: "/assets/08-gestion-documental.webp", alt: "Gestão documental de um cliente no Logixtic." }, { label: "Rastreabilidade", body: "O checklist mostra o que foi concluído e o que falta em cada operação.", image: "/assets/05-seguimiento-operativo-tareas.webp", alt: "Checklist de tarefas de uma operação no Logixtic." }, { label: "Portal", body: "Compartilhe com cada cliente as informações disponíveis de suas operações, documentos e acompanhamento." }, { label: "Indicadores", body: "Custos orçados, custos reais e margem podem ser consultados na operação.", image: "/assets/07-rentabilidad-margen.webp", alt: "Margem orçada e margem real de uma operação no Logixtic." },
  ] },
  logix: { title: "Pergunte ao Logix sobre sua operação.", body: "Logix consulta as informações disponíveis no Logixtic® para agilizar buscas de clientes, prospects, DOs, pedidos, operações e dados relacionados, respeitando as permissões de cada usuário.", exampleTitle: "Consulta operacional", query: "Onde está o pedido 4587?", answer: "Logix consulta as informações registradas de acordo com as permissões do usuário.", answerItems: ["Pedido 4587", "Status disponível na operação", "Operação relacionada", "Documentos disponíveis para esse usuário"], actions: ["Ver operação", "Consultar documentos", "Informações do cliente"] },
  portal: { title: "Seus clientes também avançam com você.", body: "O Portal de Clientes centraliza a consulta de operações, rastreabilidade, documentos, histórico e comunicação disponível para cada cliente.", diagram: ["Equipe operacional", "Logixtic®", "Cliente"], benefits: ["Visibilidade das operações", "Rastreabilidade", "Acesso a documentos", "Histórico"] },
  evidence: { title: "Empresas que já conectam sua operação com Logixtic", body: "Agentes de carga que gerenciam sua operação em uma única plataforma.", companies: [...esContent.evidence.companies], metrics: [{ value: "17.543", label: "operações globais gerenciadas" }, { value: "699", label: "agentes de carga já testaram a plataforma" }, { value: "Colômbia, Panamá e Estados Unidos (Flórida)", label: "presença atual do Logixtic®" }], cases: [{ company: "R&R Logistics CFS", result: "Mais de 20% de redução nos custos operacionais e 35% de melhoria nos tempos de resposta ao conectar sua operação em uma única plataforma." }, { company: "Connecta Global", result: "Mais de 40% de redução no acompanhamento manual de suas operações." }, { company: "Trade & Business SAS", result: "Centralização da operação comercial, operacional e documental em um único sistema." }] },
  implementation: { title: "Acompanhamos você desde a configuração até a operação real.", body: "Um processo de adoção por etapas; a duração depende do escopo de cada operação.", steps: [{ label: "Levantamento", body: "Conhecemos sua operação e sua forma de trabalhar." }, { label: "Parametrização", body: "Configuramos o sistema de acordo com sua operação." }, { label: "Capacitação", body: "Treinamos sua equipe no uso da plataforma." }, { label: "Testes", body: "Validamos o processo completo antes da entrada em operação." }, { label: "Entrada em operação", body: "Colocamos o sistema em funcionamento com sua equipe." }, { label: "Acompanhamento", body: "Continuamos com você após a entrada em operação." }] },
  faqs: [
    { q: "O que é Logixtic® e como ajuda os agentes de carga internacional?", a: "Logixtic® é um software para agentes de carga internacional: uma plataforma de gestão e inteligência operacional que conecta a gestão comercial, operacional, documental e de clientes em um único sistema, para que as informações sejam registradas uma vez e acompanhem toda a operação." }, { q: "Para que tipo de freight forwarder o Logixtic® foi desenvolvido?", a: "Foi desenvolvido para agentes de carga internacional e freight forwarders que gerenciam operações de comércio internacional com equipes comerciais, operacionais e documentais trabalhando sobre as mesmas operações." }, { q: "Quais problemas operacionais o Logixtic® ajuda a resolver?", a: "Resolve a dispersão das informações. Evita que a equipe busque, duplique e confirme dados em planilhas, e-mails, mensagens e pastas separadas antes de avançar com uma operação." }, { q: "Qual é a diferença entre o Logixtic® e um sistema tradicional para agentes de carga?", a: "Conecta o processo completo em uma única fonte de informação, do prospect aos indicadores da operação, e incorpora consultas conversacionais com o Logix sobre as informações já registradas." }, { q: "Quais processos o Logixtic® pode centralizar?", a: "Centraliza a gestão comercial, a operação, a documentação, a rastreabilidade, a consulta do cliente e os indicadores de custos e margem de cada operação." }, { q: "Como o Logixtic® reduz a dependência de planilhas, e-mails e processos manuais?", a: "As informações são registradas uma vez na plataforma e ficam disponíveis para as outras etapas, com tarefas, documentos e responsáveis associados a cada operação, em vez de arquivos e conversas separados." }, { q: "Como funcionam o Logix e a inteligência artificial no Logixtic®?", a: "Logix é uma consulta conversacional sobre as informações já registradas no Logixtic®. Permite buscar clientes, prospects, DOs, pedidos e operações respeitando as permissões de cada usuário." }, { q: "Como o Logixtic® melhora a automação e a produtividade?", a: "Ao conectar as etapas da operação, a equipe deixa de repetir lançamentos e buscas de informações. O avanço fica visível em tarefas e acompanhamento, reduzindo o trabalho manual de coordenação." }, { q: "Como funciona a gestão documental integrada?", a: "Cada documento fica associado ao cliente e à operação correspondente, com responsável e data, e pode ser consultado no cadastro do cliente ou na operação." }, { q: "Quais informações o cliente pode ver no Portal de Clientes?", a: "O cliente consulta suas operações, sua rastreabilidade, os documentos disponíveis para ele, seu histórico e a comunicação habilitada pelo agente de carga." }, { q: "Como são gerenciados usuários e permissões?", a: "O acesso às informações depende das permissões de cada usuário. Logix e o Portal de Clientes mostram apenas o que esse usuário está autorizado a consultar." }, { q: "O Logixtic® se adapta a diferentes tipos de operação e carga?", a: "Sim. A plataforma é parametrizada durante a implementação de acordo com os serviços, processos e tipos de operação de cada agente de carga." }, { q: "Quanto tempo leva para implementar o Logixtic®?", a: "A implementação tem seis etapas: levantamento, parametrização, capacitação, testes, entrada em operação e acompanhamento. A duração depende do escopo da operação e é definida com a equipe comercial." }, { q: "Quais planos o Logixtic® oferece?", a: "A proposta depende do número de usuários e do escopo da operação. É definida na demonstração personalizada com a equipe do Logixtic®." }, { q: "Como posso saber se o Logixtic® é adequado para minha operação?", a: "Agende uma demonstração personalizada: analisamos como sua equipe trabalha hoje e quais processos poderiam ser conectados na plataforma." },
  ],
  closing: { title: "Sua operação pode trabalhar com mais controle, visibilidade e inteligência.", body: "Conheça como o Logixtic® pode conectar as informações e os processos da sua operação em uma única plataforma.", note: "Após a demonstração e a análise da operação, poderá ser realizado o Diagnóstico de Maturidade Operacional e Digital, quando aplicável." },
  ui: { problemKicker: "O custo de uma operação fragmentada", transformationKicker: "A transformação Logixtic®", before: "Antes", withLogixtic: "Com Logixtic®", flowKicker: "Assim flui uma operação", flowProgress: "Progresso do fluxo operacional", logixKicker: "Logix aplicado", logixSources: "Fontes que o Logix pode consultar", query: "Consulta:", portalKicker: "Portal de Clientes", evidenceKicker: "Evidências", clientsTitle: "Agentes de Carga que já operam com Rastreabilidade, Controle e Rentabilidade.", clientsBody: "Nossos clientes reduzem tarefas manuais, recuperam tempo e tornam cada embarque rentável —da cotação à liquidação final— com total controle e visibilidade em um Sistema Operacional impulsionado por IA.", clientsLabel: "Logos de clientes do Logixtic", regionalPresence: "Presença regional", mapLabel: "Presença do Logixtic na Colômbia, no Panamá e na Flórida", successCases: "Casos de sucesso", implementationKicker: "Implementação e acompanhamento", faqKicker: "Perguntas frequentes", resourcesTitle: "Recursos para continuar avançando", resources: "Recursos", closingKicker: "Fechamento e conversão", siteNavigation: "Navegação do site", rights: "Todos os direitos reservados.", privacy: "Política de privacidade", terms: "Termos e condições", mainNavigation: "Navegação principal", mobileNavigation: "Navegação móvel", navigationMenu: "Menu de navegação", openMenu: "Abrir menu", closeMenu: "Fechar menu", home: "início", pendingRoute: "Página corporativa em breve", skipContent: "Ir para o conteúdo principal", language: "Selecionar idioma", headerCta: "Fale com um especialista", logixModules: ["Clientes", "Prospects", "DO", "Pedidos", "Operações", "Documentos"] },
};

const dictionaries: Record<Locale, Dictionary> = { es, en, "pt-BR": pt };
const STORAGE_KEY = "logixtic-language";

const LanguageContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; content: Dictionary }>({ locale: "es", setLocale: () => undefined, content: es });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en" || saved === "pt-BR") setLocaleState(saved);
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const setLocale = (next: Locale) => { setLocaleState(next); window.localStorage.setItem(STORAGE_KEY, next); };
  const value = useMemo(() => ({ locale, setLocale, content: dictionaries[locale] }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }
