/**
 * Modelo de datos — Planeación Estratégica Integratech.
 * Jerarquía: Empresa (Integratech) → Unidad/Producto → Año → Sección → Registros.
 */

export type UnitId = "logixtic" | "orbitrack" | "infraestructura" | "corporativo";

export interface UnitMeta {
  id: UnitId;
  name: string;
  tagline: string;
}

export const UNITS: UnitMeta[] = [
  { id: "logixtic", name: "Logixtic", tagline: "Planeación estratégica del producto" },
  { id: "orbitrack", name: "Orbitrack", tagline: "Planeación estratégica del producto" },
  { id: "infraestructura", name: "Infraestructura", tagline: "Planeación estratégica del producto" },
  { id: "corporativo", name: "Integratech | Corporativo", tagline: "Planeación transversal de la compañía" },
];

export const unitName = (id: UnitId): string => UNITS.find((u) => u.id === id)?.name ?? id;

export type Quarter = "T1" | "T2" | "T3" | "T4";
export const QUARTERS: Quarter[] = ["T1", "T2", "T3", "T4"];

export interface IncomeSource {
  id: string;
  name: string;
  type: string; // Recurrente | No recurrente
  periodicity: string; // Mensual | Trimestral | Anual | Único | Otro
  note: string;
}

export type MilestoneStatus = "No iniciado" | "En progreso" | "Completado" | "En riesgo";
export const MILESTONE_STATUSES: MilestoneStatus[] = ["No iniciado", "En progreso", "Completado", "En riesgo"];

export interface Milestone {
  id: string;
  quarter: Quarter;
  name: string;
  description: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  owner: string;
  status: MilestoneStatus | "";
}

export type ResourceCategory = "humanos" | "herramientas" | "software";
export const RESOURCE_CATEGORIES: { id: ResourceCategory; label: string }[] = [
  { id: "humanos", label: "Recursos humanos" },
  { id: "herramientas", label: "Herramientas / Equipos" },
  { id: "software", label: "Aplicaciones / Software" },
];

export interface Resource {
  id: string;
  category: ResourceCategory;
  name: string;
  note: string;
}

export interface Dependency {
  id: string;
  unit: UnitId | "";
  request: string;
}

export interface IncomeRow {
  id: string;
  source: string;
  unit: string;
  qty: string;
  unitValue: string;
  periodicity: string;
  period: string;
  note: string;
}

export interface ExpenseRow {
  id: string;
  concept: string;
  category: string;
  periodicity: string;
  period: string;
  value: string;
  note: string;
}

export interface InvestmentRow {
  id: string;
  concept: string;
  category: string;
  date: string;
  value: string;
  justification: string;
  note: string;
}

export interface UnitPlan {
  year: number;
  currency: string;
  incomeSources: IncomeSource[];
  milestones: Milestone[];
  timelineT4: string;
  resources: Resource[];
  dependencies: Dependency[];
  incomes: IncomeRow[];
  expenses: ExpenseRow[];
  investments: InvestmentRow[];
}

export type PlanningState = Record<UnitId, UnitPlan>;

export const emptyPlan = (): UnitPlan => ({
  year: new Date().getFullYear(),
  currency: "COP",
  incomeSources: [],
  milestones: [],
  timelineT4: "",
  resources: [],
  dependencies: [],
  incomes: [],
  expenses: [],
  investments: [],
});

/** Estado inicial: la información existente de Logixtic se conserva asociada a Integratech > Logixtic. */
export const initialState = (): PlanningState => ({
  logixtic: {
    ...emptyPlan(),
    incomeSources: [
      { id: "seed-logixtic-1", name: "Suscripción y Setup Fee", type: "", periodicity: "", note: "" },
    ],
  },
  orbitrack: emptyPlan(),
  infraestructura: emptyPlan(),
  corporativo: emptyPlan(),
});

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export type UnitStatus = "Sin iniciar" | "En progreso" | "Completa";

export function unitStatus(plan: UnitPlan): UnitStatus {
  const sections = [
    plan.incomeSources.length > 0,
    plan.milestones.length > 0,
    plan.timelineT4.trim().length > 0,
    plan.resources.length > 0,
    plan.dependencies.length > 0,
    plan.incomes.length > 0 || plan.expenses.length > 0 || plan.investments.length > 0,
  ];
  const filled = sections.filter(Boolean).length;
  if (filled === 0) return "Sin iniciar";
  if (filled === sections.length) return "Completa";
  return "En progreso";
}

export const parseNum = (v: string): number => {
  const n = Number(String(v).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export const formatMoney = (value: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "COP",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${new Intl.NumberFormat("es-CO").format(value)}`;
  }
};
