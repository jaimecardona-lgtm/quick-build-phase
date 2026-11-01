import { CINEMATIC_ENABLED } from "@/lib/cinematic-assets";

/*
 * Capa de fondo viva para la sección Logix: nodos, conexiones y paquetes de datos.
 * Decorativa (aria-hidden), sin texto. Coordenadas fijas: el render es determinista (sin hidratación distinta).
 * Solo se muestra con el sistema cinematográfico activo; el movimiento se desactiva con prefers-reduced-motion.
 */

const NODES: ReadonlyArray<readonly [number, number]> = [
  [120, 140], [320, 96], [520, 190], [760, 120], [980, 210], [1220, 140],
  [180, 420], [430, 380], [700, 440], [960, 380], [1240, 460],
  [300, 700], [640, 690], [930, 720], [1200, 680],
];

const LINKS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [2, 7], [6, 7], [7, 8], [8, 9],
  [9, 10], [7, 11], [8, 12], [12, 13], [13, 14], [9, 13], [3, 9], [5, 10],
];

// Paquetes que viajan por algunas conexiones (índices de LINKS).
const PACKETS = [0, 3, 6, 10, 14];

export function LogixDataLayer() {
  if (!CINEMATIC_ENABLED) return null;

  return (
    <svg
      className="lx-data-layer"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {LINKS.map(([a, b], i) => {
        const [x1, y1] = NODES[a]!;
        const [x2, y2] = NODES[b]!;
        return (
          <line
            key={`l${i}`}
            className="lx-data-line"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            style={{ animationDelay: `${(i % 6) * 0.6}s` }}
          />
        );
      })}
      {NODES.map(([x, y], i) => (
        <circle
          key={`n${i}`}
          className="lx-node"
          cx={x}
          cy={y}
          r={3.5}
          style={{ animationDelay: `${(i % 5) * 0.5}s` }}
        />
      ))}
      {PACKETS.map((li, i) => {
        const [a, b] = LINKS[li]!;
        const [x1, y1] = NODES[a]!;
        const [x2, y2] = NODES[b]!;
        return (
          <circle key={`p${i}`} className="lx-packet" r={2.5}>
            <animateMotion
              dur="7s"
              begin={`${i * 1.4}s`}
              repeatCount="indefinite"
              path={`M${x1} ${y1} L${x2} ${y2}`}
            />
          </circle>
        );
      })}
    </svg>
  );
}
