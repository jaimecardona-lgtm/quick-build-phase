import { MAP_H, MAP_W, mapCountries, mapPoints } from "@/lib/americas-map";

// Mapa de las Américas (datos Natural Earth, dominio público) como fondo del Hero: contexto geográfico
// de las rutas internacionales. Decorativo (aria-hidden).
const ROUTES: ReadonlyArray<readonly [keyof typeof mapPoints, keyof typeof mapPoints]> = [
  ["florida", "panama"],
  ["panama", "colombia"],
  ["venezuela", "colombia"],
  ["florida", "venezuela"],
];

export function HeroWorldMap() {
  return (
    <svg
      className="zxp-world"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {mapCountries.map((c) => (
        <path key={c.id} d={c.d} className="zxp-world-land" />
      ))}
      {ROUTES.map(([a, b], i) => {
        const [x1, y1] = mapPoints[a];
        const [x2, y2] = mapPoints[b];
        const cx = (x1 + x2) / 2;
        const cy = Math.min(y1, y2) - 60;
        return (
          <path
            key={`${a}-${b}`}
            className="zxp-world-route"
            style={{ animationDelay: `${i * 0.7}s` }}
            d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`}
          />
        );
      })}
      {Object.entries(mapPoints).map(([k, [x, y]]) => (
        <circle key={k} className="zxp-world-dot" cx={x} cy={y} r={3.2} />
      ))}
    </svg>
  );
}
