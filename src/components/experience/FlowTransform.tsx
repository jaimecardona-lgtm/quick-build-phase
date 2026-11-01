import { BarChart3, ClipboardList, FileText, Network } from "lucide-react";
import "@/components/experience/flow-transform.css";

/*
 * Secuencia visual de Flow (V2): OPERACIÓN -> INFORMACIÓN -> SISTEMA -> CONTROL.
 * Solo iconos y trazo animado: las etiquetas en palabras son copy nuevo y requieren aprobación editorial.
 * El trazo se ilumina en cadena al entrar la sección (animación CSS con retardos; transform/opacity/dash).
 */

const STEPS = [
  { Icon: ClipboardList, key: "operacion" },
  { Icon: FileText, key: "informacion" },
  { Icon: Network, key: "sistema" },
  { Icon: BarChart3, key: "control" },
] as const;

export function FlowTransform() {
  return (
    <div className="ft-band" aria-hidden="true">
      <svg className="ft-rail" viewBox="0 0 1000 40" preserveAspectRatio="none">
        {/* Centros de las cuatro columnas (12.5 %, 37.5 %, 62.5 %, 87.5 %) del grid .ft-steps. */}
        <line className="ft-track" x1="125" y1="20" x2="875" y2="20" />
        <line className="ft-trace" x1="125" y1="20" x2="875" y2="20" />
      </svg>
      <ol className="ft-steps">
        {STEPS.map(({ Icon, key }, i) => (
          <li key={key} className="ft-step" style={{ animationDelay: `${i * 0.9}s` }}>
            <span className="ft-node">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
