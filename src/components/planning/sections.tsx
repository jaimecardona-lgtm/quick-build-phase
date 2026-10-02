import { useMemo, useState } from "react";
import { RecordTable, type ColDef } from "./RecordTable";
import {
  MILESTONE_STATUSES,
  QUARTERS,
  RESOURCE_CATEGORIES,
  UNITS,
  formatMoney,
  parseNum,
  type Dependency,
  type ExpenseRow,
  type IncomeRow,
  type IncomeSource,
  type InvestmentRow,
  type Milestone,
  type Resource,
  type UnitId,
  type UnitPlan,
} from "@/lib/planning/types";

const PERIODICITY = ["Mensual", "Trimestral", "Anual", "Único", "Otro"] as const;
const INCOME_TYPES = ["Recurrente", "No recurrente"] as const;
const EXPENSE_CATEGORIES = [
  "Talento humano", "Comercial", "Marketing", "Tecnología", "Infraestructura",
  "Administración", "Soporte", "Operación", "Servicios", "Otros",
] as const;
const INVESTMENT_CATEGORIES = [
  "Producto", "Tecnología", "Infraestructura", "Expansión", "Comercial",
  "Marketing", "Desarrollo", "Equipos", "Otros",
] as const;

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pl-section">
      <h3 className="pl-section-title">{title}</h3>
      {children}
    </section>
  );
}

/* ---------------- Fuentes de ingresos ---------------- */

export function IncomeSourcesSection({ plan, update }: { plan: UnitPlan; update: (p: Partial<UnitPlan>) => void }) {
  const cols: ColDef[] = [
    { key: "name", label: "Nombre de la fuente de ingreso", placeholder: "Ej. Suscripción SaaS" },
    { key: "type", label: "Tipo de ingreso", type: "select", options: INCOME_TYPES },
    { key: "periodicity", label: "Periodicidad", type: "select", options: PERIODICITY },
    { key: "note", label: "Observación (opcional)" },
  ];
  return (
    <Section title="Fuentes de ingresos">
      <RecordTable<IncomeSource>
        cols={cols}
        rows={plan.incomeSources}
        onChange={(incomeSources) => update({ incomeSources })}
        addLabel="Agregar fuente de ingresos"
        emptyRow={() => ({ name: "", type: "", periodicity: "", note: "" })}
      />
    </Section>
  );
}

/* ---------------- Plan de Ruta + Vista Gantt ---------------- */

function monthIndex(date: string): number | null {
  if (!date) return null;
  const m = new Date(`${date}T00:00:00`).getMonth();
  return Number.isNaN(m) ? null : m;
}

function GanttView({ milestones }: { milestones: Milestone[] }) {
  const withDates = milestones.filter((m) => monthIndex(m.start) !== null || monthIndex(m.end) !== null);
  if (withDates.length === 0) {
    return <p className="pl-empty">Registra hitos con fechas de inicio y finalización en el Plan de Ruta para ver el Gantt.</p>;
  }
  return (
    <div className="pl-gantt-wrap" role="img" aria-label="Vista Gantt del plan de ruta">
      <div className="pl-gantt">
        <div className="pl-gantt-head pl-gantt-label" />
        {QUARTERS.map((q) => (
          <div key={q} className="pl-gantt-quarter">{q}</div>
        ))}
        <div className="pl-gantt-head pl-gantt-label">Hito / Actividad</div>
        {MONTHS.map((m) => (
          <div key={m} className="pl-gantt-month">{m}</div>
        ))}
        {withDates.map((m) => {
          const start = monthIndex(m.start) ?? monthIndex(m.end) ?? 0;
          const end = monthIndex(m.end) ?? monthIndex(m.start) ?? start;
          const from = Math.min(start, end);
          const to = Math.max(start, end);
          return (
            <div key={m.id} className="pl-gantt-row">
              <div className="pl-gantt-label pl-gantt-task">
                <span className="pl-gantt-task-name">{m.name || "Sin nombre"}</span>
                <span className="pl-gantt-task-meta">
                  {m.owner || "Sin responsable"} · {m.status || "No iniciado"}
                </span>
              </div>
              <div className="pl-gantt-track">
                <div
                  className={`pl-gantt-bar pl-status-${(m.status || "No iniciado").replace(/\s/g, "-").toLowerCase()}`}
                  style={{ gridColumn: `${from + 1} / ${to + 2}` }}
                  title={`${m.name} (${MONTHS[from]} – ${MONTHS[to]})`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RoadmapSection({ plan, update }: { plan: UnitPlan; update: (p: Partial<UnitPlan>) => void }) {
  const [view, setView] = useState<"plan" | "gantt">("plan");
  const cols: ColDef[] = [
    { key: "quarter", label: "Trimestre", type: "select", options: QUARTERS },
    { key: "name", label: "Hito / Actividad" },
    { key: "description", label: "Descripción" },
    { key: "start", label: "Fecha de inicio", type: "date" },
    { key: "end", label: "Fecha de finalización", type: "date" },
    { key: "owner", label: "Responsable" },
    { key: "status", label: "Estado", type: "select", options: MILESTONE_STATUSES },
  ];
  return (
    <Section title="Plan de Ruta">
      <div className="pl-tabs" role="tablist" aria-label="Vistas del plan de ruta">
        <button type="button" role="tab" aria-selected={view === "plan"} className={`pl-tab ${view === "plan" ? "is-active" : ""}`} onClick={() => setView("plan")}>
          Plan de Ruta
        </button>
        <button type="button" role="tab" aria-selected={view === "gantt"} className={`pl-tab ${view === "gantt" ? "is-active" : ""}`} onClick={() => setView("gantt")}>
          Vista Gantt
        </button>
      </div>
      {view === "plan" ? (
        <RecordTable<Milestone>
          cols={cols}
          rows={plan.milestones}
          onChange={(milestones) => update({ milestones })}
          addLabel="Agregar hito"
          emptyRow={() => ({ quarter: "T1", name: "", description: "", start: "", end: "", owner: "", status: "No iniciado" })}
        />
      ) : (
        <GanttView milestones={plan.milestones} />
      )}
    </Section>
  );
}

/* ---------------- Cronograma T4 ---------------- */

export function TimelineT4Section({ plan, update }: { plan: UnitPlan; update: (p: Partial<UnitPlan>) => void }) {
  return (
    <Section title="Cronograma T4">
      <textarea
        className="pl-input pl-textarea"
        value={plan.timelineT4}
        onChange={(e) => update({ timelineT4: e.target.value })}
        placeholder="Actividades y entregables del cuarto trimestre…"
        aria-label="Cronograma T4"
      />
    </Section>
  );
}

/* ---------------- Recursos necesarios ---------------- */

export function ResourcesSection({ plan, update }: { plan: UnitPlan; update: (p: Partial<UnitPlan>) => void }) {
  const cols: ColDef[] = [
    { key: "name", label: "Recurso", placeholder: "Ej. SDR, Computadores, HubSpot…" },
    { key: "note", label: "Observación (opcional)" },
  ];
  return (
    <Section title="Recursos necesarios">
      <div className="pl-resource-grid">
        {RESOURCE_CATEGORIES.map((cat) => {
          const rows = plan.resources.filter((r) => r.category === cat.id);
          return (
            <div key={cat.id} className="pl-resource-cat">
              <h4 className="pl-resource-cat-title">{cat.label}</h4>
              <RecordTable<Resource>
                cols={cols}
                rows={rows}
                onChange={(next) =>
                  update({ resources: [...plan.resources.filter((r) => r.category !== cat.id), ...next] })
                }
                addLabel="Agregar recurso"
                emptyRow={() => ({ category: cat.id, name: "", note: "" })}
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------------- Qué necesitas de las otras empresas ---------------- */

export function DependenciesSection({ plan, update }: { plan: UnitPlan; update: (p: Partial<UnitPlan>) => void }) {
  const cols: ColDef[] = [
    { key: "unit", label: "Empresa / unidad requerida", type: "select", options: UNITS.map((u) => u.name) },
    { key: "request", label: "Solicitud / necesidad", placeholder: "Ej. Apoyo comercial para generación de demanda…" },
  ];
  return (
    <Section title="Qué necesitas de las otras empresas">
      <RecordTable<Dependency>
        cols={cols}
        rows={plan.dependencies}
        onChange={(dependencies) => update({ dependencies })}
        addLabel="Agregar solicitud"
        emptyRow={() => ({ unit: "", request: "" })}
      />
    </Section>
  );
}

/* ---------------- Estructura financiera ---------------- */

export function FinanceSection({ plan, update }: { plan: UnitPlan; update: (p: Partial<UnitPlan>) => void }) {
  const incomeCols: ColDef[] = [
    { key: "source", label: "Fuente de ingreso", type: "select", options: plan.incomeSources.map((s) => s.name).filter(Boolean) },
    { key: "unit", label: "Producto / Unidad" },
    { key: "qty", label: "Cantidad", type: "number" },
    { key: "unitValue", label: "Valor unitario", type: "number" },
    { key: "periodicity", label: "Periodicidad", type: "select", options: PERIODICITY },
    { key: "period", label: "Mes o período" },
    { key: "note", label: "Observaciones" },
  ];
  const expenseCols: ColDef[] = [
    { key: "concept", label: "Concepto" },
    { key: "category", label: "Categoría", type: "select", options: EXPENSE_CATEGORIES },
    { key: "periodicity", label: "Periodicidad", type: "select", options: PERIODICITY },
    { key: "period", label: "Mes o período" },
    { key: "value", label: "Valor", type: "number" },
    { key: "note", label: "Observaciones" },
  ];
  const investmentCols: ColDef[] = [
    { key: "concept", label: "Concepto" },
    { key: "category", label: "Categoría", type: "select", options: INVESTMENT_CATEGORIES },
    { key: "date", label: "Fecha estimada", type: "date" },
    { key: "value", label: "Valor", type: "number" },
    { key: "justification", label: "Justificación" },
    { key: "note", label: "Observaciones" },
  ];

  const incomeTotal = plan.incomes.reduce((acc, r) => {
    const qty = parseNum(r.qty);
    const unit = parseNum(r.unitValue);
    return acc + (qty && unit ? qty * unit : unit || qty);
  }, 0);
  const expenseTotal = plan.expenses.reduce((acc, r) => acc + parseNum(r.value), 0);
  const investmentTotal = plan.investments.reduce((acc, r) => acc + parseNum(r.value), 0);
  const result = incomeTotal - expenseTotal - investmentTotal;

  const subtotalRow = (label: string, total: number, colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="pl-subtotal-label">{label}</td>
      <td className="pl-subtotal-value">{formatMoney(total, plan.currency)}</td>
      <td />
    </tr>
  );

  return (
    <Section title="Estructura financiera">
      <div className="pl-currency">
        <label htmlFor="pl-currency">Moneda</label>
        <select
          id="pl-currency"
          className="pl-input pl-currency-select"
          value={plan.currency}
          onChange={(e) => update({ currency: e.target.value })}
        >
          <option value="COP">COP — Peso colombiano</option>
          <option value="USD">USD — Dólar estadounidense</option>
          <option value="EUR">EUR — Euro</option>
        </select>
      </div>

      <h4 className="pl-subsection-title">Ingresos / Ventas</h4>
      <RecordTable<IncomeRow>
        cols={incomeCols}
        rows={plan.incomes}
        onChange={(incomes) => update({ incomes })}
        addLabel="Agregar registro"
        emptyRow={() => ({ source: "", unit: "", qty: "", unitValue: "", periodicity: "", period: "", note: "" })}
        footer={subtotalRow("Subtotal ingresos", incomeTotal, incomeCols.length - 1)}
      />

      <h4 className="pl-subsection-title">Gastos de Operación</h4>
      <RecordTable<ExpenseRow>
        cols={expenseCols}
        rows={plan.expenses}
        onChange={(expenses) => update({ expenses })}
        addLabel="Agregar registro"
        emptyRow={() => ({ concept: "", category: "", periodicity: "", period: "", value: "", note: "" })}
        footer={subtotalRow("Subtotal gastos de operación", expenseTotal, expenseCols.length - 1)}
      />

      <h4 className="pl-subsection-title">Inversión</h4>
      <RecordTable<InvestmentRow>
        cols={investmentCols}
        rows={plan.investments}
        onChange={(investments) => update({ investments })}
        addLabel="Agregar registro"
        emptyRow={() => ({ concept: "", category: "", date: "", value: "", justification: "", note: "" })}
        footer={subtotalRow("Subtotal inversión", investmentTotal, investmentCols.length - 1)}
      />

      <div className="pl-summary" aria-label="Resumen financiero">
        <h4 className="pl-subsection-title">Resumen financiero</h4>
        <dl className="pl-summary-grid">
          <div><dt>Ingresos totales</dt><dd>{formatMoney(incomeTotal, plan.currency)}</dd></div>
          <div><dt>− Gastos de operación</dt><dd>{formatMoney(expenseTotal, plan.currency)}</dd></div>
          <div><dt>− Inversión</dt><dd>{formatMoney(investmentTotal, plan.currency)}</dd></div>
          <div className="pl-summary-result"><dt>= Resultado / necesidad de caja</dt><dd>{formatMoney(result, plan.currency)}</dd></div>
        </dl>
      </div>
    </Section>
  );
}

/* ---------------- Formulario completo por unidad ---------------- */

export function PlanningForm({ unitId, plan, update }: { unitId: UnitId; plan: UnitPlan; update: (p: Partial<UnitPlan>) => void }) {
  void unitId;
  return (
    <div className="pl-form">
      <div className="pl-year">
        <label htmlFor="pl-year">Año de planeación</label>
        <input
          id="pl-year"
          className="pl-input pl-year-input"
          type="number"
          value={plan.year}
          onChange={(e) => update({ year: Number(e.target.value) || plan.year })}
        />
      </div>
      <IncomeSourcesSection plan={plan} update={update} />
      <RoadmapSection plan={plan} update={update} />
      <TimelineT4Section plan={plan} update={update} />
      <ResourcesSection plan={plan} update={update} />
      <DependenciesSection plan={plan} update={update} />
      <FinanceSection plan={plan} update={update} />
    </div>
  );
}

export function useUnitNames(): string[] {
  return useMemo(() => UNITS.map((u) => u.name), []);
}
