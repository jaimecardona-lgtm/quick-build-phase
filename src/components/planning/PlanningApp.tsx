import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PlanningProvider, usePlanning } from "@/lib/planning/store";
import { UNITS, unitStatus, type UnitId } from "@/lib/planning/types";
import { PlanningForm } from "./sections";

function UnitsHome({ onOpen }: { onOpen: (unit: UnitId) => void }) {
  const { state } = usePlanning();
  return (
    <div className="pl-units">
      <h2 className="pl-units-title">Planeación estratégica</h2>
      <p className="pl-units-sub">Selecciona la unidad o producto que quieres trabajar.</p>
      <div className="pl-units-grid">
        {UNITS.map((unit) => {
          const status = unitStatus(state[unit.id]);
          return (
            <article key={unit.id} className="pl-card">
              <h3 className="pl-card-name">{unit.name}</h3>
              <p className="pl-card-tagline">{unit.tagline}</p>
              <p className={`pl-card-status pl-card-status-${status === "Sin iniciar" ? "idle" : status === "En progreso" ? "progress" : "done"}`}>
                Estado: {status}
              </p>
              <button type="button" className="pl-open-btn" onClick={() => onOpen(unit.id)}>
                Abrir planeación <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PlanningShell() {
  const [activeUnit, setActiveUnit] = useState<UnitId | null>(null);
  const { state, updateUnit } = usePlanning();
  const unit = UNITS.find((u) => u.id === activeUnit);

  return (
    <div className="pl-app">
      <header className="pl-header">
        <div className="pl-header-inner">
          <a href="/" className="pl-brand" aria-label="Integratech, volver al inicio">
            Integratech
          </a>
          <span className="pl-header-tag">Planeación Estratégica</span>
        </div>
      </header>

      <main className="pl-main">
        {unit ? (
          <>
            <nav className="pl-breadcrumb" aria-label="Ruta de navegación">
              <button type="button" className="pl-back-btn" onClick={() => setActiveUnit(null)}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver a unidades
              </button>
              <p className="pl-breadcrumb-trail">
                Integratech <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> {unit.name}{" "}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> Planeación estratégica
              </p>
            </nav>
            <h2 className="pl-unit-title">{unit.name}</h2>
            <p className="pl-unit-tagline">{unit.tagline}</p>
            <PlanningForm
              unitId={unit.id}
              plan={state[unit.id]}
              update={(partial) => updateUnit(unit.id, (prev) => ({ ...prev, ...partial }))}
            />
          </>
        ) : (
          <UnitsHome onOpen={setActiveUnit} />
        )}
      </main>
    </div>
  );
}

export function PlanningApp() {
  return (
    <PlanningProvider>
      <PlanningShell />
    </PlanningProvider>
  );
}
