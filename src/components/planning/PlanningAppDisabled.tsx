// Sustituto del módulo interno de planeación en builds públicos (sin VITE_PLANEACION_ENABLED=true).
// El código real de PlanningApp no entra al bundle: vite.config.ts redirige la importación aquí.
export function PlanningApp() {
  return null;
}
