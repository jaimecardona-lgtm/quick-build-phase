import globeAsset from "@/assets/closing-globe.webp.asset.json";
import { FORWARDERS_V2 } from "@/lib/cinematic-assets";
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

/*
 * V2: aviones, camiones y barcos en órbita alrededor del globo (motion SVG, sin video).
 * Los videos de avión tienen marcas visibles o derechos sin verificar, y escaneo.mp4 muestra a una persona.
 * Órbitas: elipses centradas en el globo (340, 194). Los iconos siguen la elipse con animateMotion.
 */
const ORBIT_A = "M40 194 A300 110 0 1 0 640 194 A300 110 0 1 0 40 194";
const ORBIT_B = "M110 194 A230 160 0 1 1 570 194 A230 160 0 1 1 110 194";

// Variante zenox: cada transporte recorre su medio. Coordenadas en el espacio 680×388 del globo.
// Avión: órbita aérea alrededor del planeta. Barco: corredor del Atlántico (agua). Camión: África (tierra).
const ZX_AIR_PATH = "M 38 218 A 205 130 0 1 0 448 218 A 205 130 0 1 0 38 218";
const ZX_SEA_PATH = "M 262 100 A 20 105 0 1 0 262 310 A 20 105 0 1 0 262 100";
const ZX_LAND_PATH = "M 345 185 A 22 45 0 1 0 345 275 A 22 45 0 1 0 345 185";

// Vehículos del globo: SVG premium del kit Zenox (public/zenox-kit/transport), elementos independientes de la escena.
// Mismas órbitas y tiempos que antes. El avión sigue la tangente de la órbita; barco y camión van derechos.
const VEHICLE_W = 104;
const VEHICLE_H = Math.round((VEHICLE_W * 260) / 640 * 10) / 10;
// Variante zenox: transportes a tamaño base (antes 1.6×), más pequeños sobre el globo. La legacy no cambia.
const ZX_VEHICLE_W = VEHICLE_W;
const ZX_VEHICLE_H = VEHICLE_H;
function OrbitTrafficZenox() {
  return (
    <svg className="gc-orbits" viewBox="0 0 680 388" focusable="false" aria-hidden="true">
      <path d={ORBIT_A} className="gc-orbit-line" />
      <path d={ORBIT_B} className="gc-orbit-line gc-orbit-line-b" />
      <g className="gc-vehicle gc-vehicle-plane">
        <image href="/zenox-kit/transport/avion-premium.svg" x={-ZX_VEHICLE_W / 2} y={-ZX_VEHICLE_H / 2} width={ZX_VEHICLE_W} height={ZX_VEHICLE_H} />
        <animateMotion dur="16s" repeatCount="indefinite" path={ZX_AIR_PATH} rotate="auto" />
      </g>
      <g className="gc-vehicle gc-vehicle-ship">
        <image href="/zenox-kit/transport/barco-premium.svg" x={-ZX_VEHICLE_W / 2} y={-ZX_VEHICLE_H / 2} width={ZX_VEHICLE_W} height={ZX_VEHICLE_H} />
        <animateMotion dur="16s" begin="-8s" repeatCount="indefinite" path={ZX_SEA_PATH} />
      </g>
      <g className="gc-vehicle gc-vehicle-truck">
        <image href="/zenox-kit/transport/camion-premium.svg" x={-ZX_VEHICLE_W / 2} y={-ZX_VEHICLE_H / 2} width={ZX_VEHICLE_W} height={ZX_VEHICLE_H} />
        <animateMotion dur="24s" repeatCount="indefinite" path={ZX_LAND_PATH} />
      </g>
    </svg>
  );
}

function OrbitTrafficLegacy() {
  return (
    <svg className="gc-orbits" viewBox="0 0 680 388" focusable="false">
      <path d={ORBIT_A} className="gc-orbit-line" />
      <path d={ORBIT_B} className="gc-orbit-line gc-orbit-line-b" />
      <g className="gc-orbit-icon">
        <g transform="scale(2.6)"><path d="M0 -6 L1 -1 L6 1 L6 2.5 L1 1.5 L1 4.5 L3 6 L3 7 L0 6.2 L-3 7 L-3 6 L-1 4.5 L-1 1.5 L-6 2.5 L-6 1 L-1 -1 Z" /></g>
        <animateMotion dur="16s" repeatCount="indefinite" path={ORBIT_A} />
      </g>
      <g className="gc-orbit-icon gc-orbit-icon-ship">
        <g transform="scale(2.6)"><path d="M-6 0 L6 0 L4 4 L-4 4 Z M-2 -4 L2 -4 L2 0 L-2 0 Z" /></g>
        <animateMotion dur="16s" begin="-8s" repeatCount="indefinite" path={ORBIT_A} />
      </g>
      <g className="gc-orbit-icon gc-orbit-icon-truck">
        <g transform="scale(2.6)"><rect x="-6" y="-4" width="8" height="6" rx="1" /><rect x="2" y="-2" width="4" height="4" rx="1" /></g>
        <animateMotion dur="24s" repeatCount="indefinite" path={ORBIT_B} />
      </g>
    </svg>
  );
}

export function GlobalCoverage({ variant = "legacy" }: { variant?: "legacy" | "zenox" } = {}) {
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
        {FORWARDERS_V2 ? (variant === "zenox" ? <OrbitTrafficZenox /> : <OrbitTrafficLegacy />) : null}
      </div>
    </div>
  );
}
