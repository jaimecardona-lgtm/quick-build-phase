import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MAP_H, MAP_W, mapCountries, mapPoints } from "@/lib/americas-map";
import type { Locale } from "@/lib/i18n";
import "@/components/experience/logistics-routes.css";

/*
 * Mapa logístico estilizado para la sección de presencia regional.
 * El mapa de las Américas y los puntos existentes son los de src/lib/americas-map.ts (sin cambios).
 * Las rutas, escalas, trackings, estados y fechas son DEMOSTRATIVOS y no representan datos reales.
 */

type PlaceKey = keyof typeof mapPoints;
type Place = { key: PlaceKey; side: "r" | "l" | "t" };

type Props = {
  caption: string;
  places: readonly Place[];
  placeLabels: Record<PlaceKey, string>;
  highlighted: Set<string>;
  mapLabel: string;
  locale: Locale;
};

// Lienzo ampliado a izquierda y derecha para que las rutas de Asia y Europa entren desde los bordes.
const VIEW = { x: -200, y: -20, w: MAP_W + 400, h: MAP_H + 40 };

const ROUTES = [
  { id: "shanghai", kind: "ship", d: "M -170 120 Q 150 260 333.3 229.7", hop: [115.8, 217.4] },
  { id: "valencia", kind: "ship", d: "M 770 170 Q 640 330 333.3 229.7", hop: [595.8, 264.9] },
  { id: "miami", kind: "plane", d: "M 320.8 58.4 Q 290 150 333.3 229.7", hop: [308.5, 147] },
  { id: "hop", kind: "plane", d: "M 333.3 229.7 Q 352 262 382.5 262.4", hop: null },
] as const;

const COPY = {
  es: {
    demo: "Datos demostrativos · no son operaciones reales",
    tracking: "Tracking demo en Logixtic",
    status: {
      transit: "En tránsito",
      stop: "En escala",
      control: "Control documental",
      done: "Entregado",
    },
    eta: "ETA",
    last: "Último evento",
    events: {
      transit: "Zarpe confirmado",
      stop: "Llegada a escala · Panamá",
      control: "Documentos validados",
      done: "Confirmado por el cliente",
    },
    cities: {
      shanghai: "Shanghái",
      valencia: "Valencia",
      miami: "Miami",
      panama: "Panamá",
      colombia: "Colombia",
    },
    orders: ["SHA", "VLC", "MIA"],
  },
  en: {
    demo: "Demo data · not real operations",
    tracking: "Demo tracking in Logixtic",
    status: {
      transit: "In transit",
      stop: "At transshipment",
      control: "Document control",
      done: "Delivered",
    },
    eta: "ETA",
    last: "Last event",
    events: {
      transit: "Departure confirmed",
      stop: "Arrived at transshipment · Panama",
      control: "Documents validated",
      done: "Confirmed by the customer",
    },
    cities: {
      shanghai: "Shanghai",
      valencia: "Valencia",
      miami: "Miami",
      panama: "Panama",
      colombia: "Colombia",
    },
    orders: ["SHA", "VLC", "MIA"],
  },
  pt: {
    demo: "Dados demonstrativos · não são operações reais",
    tracking: "Tracking demo no Logixtic",
    status: {
      transit: "Em trânsito",
      stop: "Em escala",
      control: "Controle documental",
      done: "Entregue",
    },
    eta: "ETA",
    last: "Último evento",
    events: {
      transit: "Saída confirmada",
      stop: "Chegada à escala · Panamá",
      control: "Documentos validados",
      done: "Confirmado pelo cliente",
    },
    cities: {
      shanghai: "Xangai",
      valencia: "Valência",
      miami: "Miami",
      panama: "Panamá",
      colombia: "Colômbia",
    },
    orders: ["SHA", "VLC", "MIA"],
  },
} as const;

const CARDS = [
  {
    key: "shanghai",
    eta: { es: "18 nov", en: "Nov 18", pt: "18 nov" },
    progress: 0.62,
    status: "stop",
  },
  {
    key: "valencia",
    eta: { es: "21 nov", en: "Nov 21", pt: "21 nov" },
    progress: 0.38,
    status: "transit",
  },
  {
    key: "miami",
    eta: { es: "14 nov", en: "Nov 14", pt: "14 nov" },
    progress: 0.92,
    status: "control",
  },
] as const;

// Orígenes demostrativos. Shanghái y Valencia entran desde los bordes del lienzo ampliado.
const ORIGINS = [
  { key: "shanghai", x: -170, y: 120, side: "above" },
  { key: "valencia", x: 770, y: 170, side: "above-left" },
  { key: "miami", x: 320.8, y: 58.4, side: "left" },
] as const;

const PLANE_GLYPH =
  "M-12 0 L-2 -2 L4 -12 L7 -12 L3 -2 L10 -1 L12 -4 L14 -4 L13 0 L14 4 L12 4 L10 1 L3 2 L7 12 L4 12 L-2 2 Z";
const SHIP_GLYPH = "M-12 -2 H12 L9 6 H-9 Z";

function localeKey(locale: Locale): keyof typeof COPY {
  return locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";
}

export function LogisticsRoutes({
  caption,
  places,
  placeLabels,
  highlighted,
  mapLabel,
  locale,
}: Props) {
  const d = COPY[localeKey(locale)];
  const figureRef = useRef<HTMLElement>(null);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const travelerRefs = useRef<Record<string, SVGGElement | null>>({});
  const [hot, setHot] = useState<PlaceKey | null>(null);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const travelers: { tween: gsap.core.Tween; pos: { p: number } }[] = [];

    ROUTES.forEach((route, index) => {
      const path = pathRefs.current[route.id];
      const traveler = travelerRefs.current[route.id];
      if (!path || !traveler) return;
      const length = path.getTotalLength();
      const pos = { p: index * 0.2 };
      const place = (p: number) => {
        const point = path.getPointAtLength(length * p);
        const ahead = path.getPointAtLength(length * Math.min(1, p + 0.01));
        const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
        traveler.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
      };
      if (reduced) {
        place(0.5);
        return;
      }
      place(pos.p);
      const tween = gsap.to(pos, {
        p: 1,
        duration: 9,
        ease: "none",
        repeat: -1,
        paused: true,
        onUpdate: () => place(pos.p),
      });
      travelers.push({ tween, pos });
    });

    if (reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        travelers.forEach(({ tween }) => (entry?.isIntersecting ? tween.play() : tween.pause()));
      },
      { threshold: 0.15 },
    );
    observer.observe(figure);
    return () => {
      observer.disconnect();
      travelers.forEach(({ tween }) => tween.kill());
    };
  }, []);

  return (
    <figure ref={figureRef} className="lr-figure">
      <figcaption className="font-display">{caption}</figcaption>
      <div className="lr-demo-chip font-ui">{d.demo}</div>
      <svg
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
        role="img"
        aria-label={mapLabel}
        className="lr-svg"
      >
        <defs>
          <pattern id="lr-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" className="lr-grid-dot" />
          </pattern>
          <radialGradient id="lr-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" className="lr-glow-stop" />
            <stop offset="100%" className="lr-glow-end" />
          </radialGradient>
        </defs>
        <rect
          x={VIEW.x}
          y={VIEW.y}
          width={VIEW.w}
          height={VIEW.h}
          fill="url(#lr-grid)"
          className="lr-ocean"
        />
        {mapCountries.map((c) => (
          <path key={c.id} d={c.d} className="lr-land" data-hl={highlighted.has(c.id)} />
        ))}

        {ROUTES.map((route) => (
          <g key={route.id}>
            <path
              id={`lr-route-${route.id}`}
              ref={(el) => {
                pathRefs.current[route.id] = el;
              }}
              d={route.d}
              className="lr-route"
            />
            {route.hop ? (
              <g className="lr-hop" transform={`translate(${route.hop[0]} ${route.hop[1]})`}>
                <circle r="9" className="lr-hop-ring" />
                <circle r="3" className="lr-hop-dot" />
              </g>
            ) : null}
            <g
              ref={(el) => {
                travelerRefs.current[route.id] = el;
              }}
              className="lr-traveler"
            >
              <path d={route.kind === "plane" ? PLANE_GLYPH : SHIP_GLYPH} className="lr-glyph" />
            </g>
          </g>
        ))}

        {ORIGINS.map(({ key, x, y, side }) => {
          const label = d.cities[key];
          const w = label.length * 11 + 26;
          // Miami comparte punto con Florida: su etiqueta va a la izquierda para no taparla.
          const lx = side === "left" ? x - w - 14 : side === "above-left" ? x - w + 4 : x - 6;
          const ly = side === "left" ? y - 16 : y - 46;
          return (
            <g key={key} className="lr-origin" aria-hidden="true">
              <circle cx={x} cy={y} r="8" className="lr-origin-pulse" />
              <circle cx={x} cy={y} r="4.5" className="lr-origin-dot" />
              <rect x={lx} y={ly} width={w} height="32" rx="16" className="lr-tag" />
              <text x={lx + w / 2} y={ly + 21} textAnchor="middle" className="lr-tag-text">
                {label}
              </text>
            </g>
          );
        })}

        {places.map(({ key, side }) => {
          const [x, y] = mapPoints[key];
          const label = placeLabels[key];
          const w = label.length * 11 + 26;
          const lx = side === "r" ? x + 14 : side === "t" ? x - w / 2 : x - 14 - w;
          const ly = side === "t" ? y - 34 : y - 16;
          return (
            <g
              key={key}
              className="lr-place"
              data-hot={hot === key}
              tabIndex={0}
              role="img"
              aria-label={label}
              onMouseEnter={() => setHot(key)}
              onMouseLeave={() => setHot(null)}
              onFocus={() => setHot(key)}
              onBlur={() => setHot(null)}
              onTouchStart={() => setHot(key)}
            >
              <circle className="lr-pulse" cx={x} cy={y} r="6" />
              <circle className="lr-dot" cx={x} cy={y} r="6" />
              <rect x={lx} y={ly - 12} width={w} height="24" rx="12" className="lr-place-tag" />
              <text x={lx + w / 2} y={ly + 4.5} textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="lr-cards-title font-ui">{d.tracking}</p>
      <ol className="lr-cards">
        {CARDS.map((card, index) => {
          const city = d.cities[card.key];
          return (
            <li key={card.key} className="lr-card" data-status={card.status}>
              <div className="lr-card-head">
                <span className="lr-code font-ui">
                  DEMO-{d.orders[index]}-{2611 + index * 3}
                </span>
                <span className="lr-chip font-ui">{d.status[card.status]}</span>
              </div>
              <p className="lr-route-line font-ui">
                {city} → {d.cities.panama} → {d.cities.colombia}
              </p>
              <div className="lr-bar" aria-hidden="true">
                <span style={{ transform: `scaleX(${card.progress})` }} />
              </div>
              <div className="lr-meta font-ui">
                <span>
                  {d.eta} · {card.eta[localeKey(locale)]}
                </span>
                <span>
                  {d.last}: {d.events[card.status]}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
