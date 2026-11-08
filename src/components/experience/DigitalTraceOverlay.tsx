import { CINEMATIC_ENABLED } from "@/lib/cinematic-assets";
import "@/components/experience/digital-trace.css";

/*
 * Acto B de Flow: una banda de datos que recorre el fondo desde el evento físico hacia el software.
 * Ilustrativa (DEMO). No representa una integración ni datos reales en vivo. Solo transform/opacity
 * y el desplazamiento del trazo. Sin el flag cinematográfico no se renderiza.
 */

const TRACE = "M-40 250 C 360 200, 1080 280, 1480 240";
const NODES = [
  { x: 120, y: 290 },
  { x: 480, y: 330 },
  { x: 860, y: 190 },
  { x: 1240, y: 200 },
];

export function DigitalTraceOverlay() {
  if (!CINEMATIC_ENABLED) return null;

  return (
    <div className="dt-layer" aria-hidden="true">
      <svg className="dt-svg" viewBox="0 0 1440 480" preserveAspectRatio="none" focusable="false">
        <path className="dt-trace" d={TRACE} />
        {NODES.map((n) => (
          <circle key={`${n.x}-${n.y}`} className="dt-node" cx={n.x} cy={n.y} r="5" />
        ))}
      </svg>
      <span className="dt-packet" />
    </div>
  );
}
