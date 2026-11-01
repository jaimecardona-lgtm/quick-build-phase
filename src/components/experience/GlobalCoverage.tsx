import globeAsset from "@/assets/closing-globe.webp.asset.json";
import "@/components/experience/global-coverage.css";

/*
 * Cobertura global: planeta con conexiones internacionales. Decorativo (aria-hidden), sin texto.
 * Movimiento en bucle autónomo con CSS (flotación, halo, arcos y nodos). No depende del ratón.
 * Plano: globo existente del proyecto (680×388). Para un globo rotatorio real, reemplazar por un
 * video o modelo 3D aprobado (ver docs/cinematic-asset-audit.md).
 */

const ARCS = [
  "M90 170 Q 250 40 400 190",
  "M400 190 Q 520 300 600 130",
  "M120 260 Q 260 330 400 190",
  "M60 120 Q 200 280 330 300",
] as const;

const NODES = [
  [90, 170],
  [400, 190],
  [600, 130],
  [120, 260],
  [330, 300],
] as const;

export function GlobalCoverage() {
  return (
    <div className="gc-band" aria-hidden="true">
      <div className="gc-halo" />
      <div className="gc-ring gc-ring-a" />
      <div className="gc-ring gc-ring-b" />
      <div className="gc-globe">
        <img src={globeAsset.url} alt="" width={680} height={388} loading="lazy" decoding="async" />
        <svg className="gc-arcs" viewBox="0 0 680 388" focusable="false">
          {ARCS.map((d, i) => (
            <path key={d} d={d} className="gc-arc" style={{ animationDelay: `${i * -1.4}s` }} />
          ))}
          {NODES.map(([x, y], i) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="4"
              className="gc-node"
              style={{ animationDelay: `${i * -0.7}s` }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
