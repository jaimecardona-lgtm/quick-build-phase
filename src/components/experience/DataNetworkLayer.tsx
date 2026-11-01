import { CINEMATIC_ENABLED } from "@/lib/cinematic-assets";
import "@/components/experience/dn-layer.css";

/*
 * Capa SVG de datos para secciones sin video exclusivo (variante V2). Decorativa (aria-hidden), sin texto.
 * Geometría fija y determinista (sin aleatorio) para que SSR e hidratación coincidan.
 * - network:    red de nodos y enlaces (clientes, FAQ, casos).
 * - dispersion: nodos dispersos que convergen en un centro (problema: sin sistema = dispersión).
 * - rails:      rieles con paradas (implementación: pasos conectados).
 * - routes:     arcos entre nodos (evidencia: rutas internacionales).
 * Solo se muestra con el sistema cinematográfico activo (CINEMATIC_ENABLED).
 */

type Variant = "network" | "dispersion" | "rails" | "routes";

const W = 1440;
const H = 900;

const NETWORK_NODES: ReadonlyArray<readonly [number, number]> = Array.from({ length: 18 }, (_, i) => [
  (i * 197 + 60) % W,
  (i * 331 + 90) % H,
] as const);

const DISPERSION_NODES: ReadonlyArray<readonly [number, number]> = Array.from({ length: 14 }, (_, i) => [
  (i * 263 + 80) % W,
  (i * 157 + 60) % H,
] as const);
const HUB: readonly [number, number] = [720, 450];

const RAIL_ROWS: readonly number[] = [140, 270, 400, 530, 660, 790];

export function DataNetworkLayer({ variant }: { variant: Variant }) {
  if (!CINEMATIC_ENABLED) return null;

  return (
    <svg
      className={`dn-layer dn-${variant}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {variant === "network" || variant === "routes"
        ? NETWORK_NODES.map(([x, y], i) => {
            const [x2, y2] = NETWORK_NODES[(i + 5) % NETWORK_NODES.length]!;
            const cx = (x + x2) / 2;
            const cy = (y + y2) / 2 - 140;
            return variant === "routes" ? (
              <path
                key={`r${i}`}
                className="dn-route"
                d={`M${x} ${y} Q${cx} ${cy} ${x2} ${y2}`}
                style={{ animationDelay: `${(i % 6) * 0.5}s` }}
              />
            ) : (
              <line key={`l${i}`} className="dn-line" x1={x} y1={y} x2={x2} y2={y2} style={{ animationDelay: `${(i % 5) * 0.6}s` }} />
            );
          })
        : null}

      {variant === "dispersion"
        ? DISPERSION_NODES.map(([x, y], i) => (
            <line key={`d${i}`} className="dn-line dn-converge" x1={x} y1={y} x2={HUB[0]} y2={HUB[1]} style={{ animationDelay: `${(i % 7) * 0.4}s` }} />
          ))
        : null}

      {variant === "rails"
        ? RAIL_ROWS.map((y, i) => (
            <g key={`rail${i}`}>
              <line className="dn-rail" x1={0} y1={y} x2={W} y2={y} />
              {Array.from({ length: 7 }, (_, s) => (
                <circle key={s} className="dn-stop" cx={120 + s * 200} cy={y} r={3} style={{ animationDelay: `${(s + i) * 0.3}s` }} />
              ))}
            </g>
          ))
        : null}

      {variant === "network" || variant === "routes"
        ? NETWORK_NODES.map(([x, y], i) => (
            <circle key={`n${i}`} className="dn-node" cx={x} cy={y} r={3} style={{ animationDelay: `${(i % 5) * 0.5}s` }} />
          ))
        : null}

      {variant === "dispersion" ? (
        <>
          {DISPERSION_NODES.map(([x, y], i) => (
            <circle key={`dn${i}`} className="dn-node" cx={x} cy={y} r={3} style={{ animationDelay: `${(i % 5) * 0.5}s` }} />
          ))}
          <circle className="dn-hub" cx={HUB[0]} cy={HUB[1]} r={9} />
        </>
      ) : null}
    </svg>
  );
}
