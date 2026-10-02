import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { initialState, type PlanningState, type UnitId, type UnitPlan } from "./types";

const STORAGE_KEY = "integratech-planning-v1";

interface PlanningContextValue {
  state: PlanningState;
  updateUnit: (unit: UnitId, updater: (plan: UnitPlan) => UnitPlan) => void;
}

const PlanningContext = createContext<PlanningContextValue | null>(null);

function loadState(): PlanningState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<PlanningState>;
    const base = initialState();
    // Migración no destructiva: conserva todo lo guardado y completa campos faltantes.
    (Object.keys(base) as UnitId[]).forEach((id) => {
      const saved = parsed[id];
      if (saved) base[id] = { ...base[id], ...saved };
    });
    return base;
  } catch {
    return initialState();
  }
}

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlanningState>(loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // almacenamiento no disponible; la sesión sigue funcionando en memoria
    }
  }, [state]);

  const value = useMemo<PlanningContextValue>(
    () => ({
      state,
      updateUnit: (unit, updater) =>
        setState((prev) => ({ ...prev, [unit]: updater(prev[unit]) })),
    }),
    [state],
  );

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning(): PlanningContextValue {
  const ctx = useContext(PlanningContext);
  if (!ctx) throw new Error("usePlanning debe usarse dentro de PlanningProvider");
  return ctx;
}
