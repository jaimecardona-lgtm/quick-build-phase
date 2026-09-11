import { useEffect, useRef, useState } from "react";

type Visual =
  | { kind: "nodes" }
  | { kind: "shot"; src: string; alt: string; width: number; height: number; zoom?: boolean };

type Stage = {
  id: string;
  section: "problema" | "transformacion" | "flujo";
  kicker: string;
  title: string;
  body: string;
  hotspot: string;
  visual: Visual;
};

const SHOTS = {
  s02: {
    src: "/assets/02-gestion-comercial-resumen.webp",
    width: 1728,
    height: 910,
    alt: "Resumen comercial de una empresa en Logixtic con actividad, funnel y etapa del prospecto.",
  },
  s03: {
    src: "/assets/03-gestion-comercial-timeline.webp",
    width: 1759,
    height: 894,
    alt: "Timeline de actividad comercial con registros de llamadas y cambios de etapa fechados.",
  },
  s04: {
    src: "/assets/04-seguimiento-operativo-pasos.webp",
    width: 1885,
    height: 834,
    alt: "Seguimiento de una operación por pasos numerados, desde radicación hasta agencia de aduana.",
  },
  s05: {
    src: "/assets/05-seguimiento-operativo-tareas.webp",
    width: 1600,
    height: 739,
    alt: "Checklist de tareas operativas del DO con avance marcado sobre el total de actividades.",
  },
  s06: {
    src: "/assets/06-costos-operacion.webp",
    width: 1836,
    height: 856,
    alt: "Tabla de costos de la operación comparando costo presupuestado y costo real por servicio.",
  },
  s07: {
    src: "/assets/07-rentabilidad-margen.webp",
    width: 1600,
    height: 732,
    alt: "Comparación de margen presupuestado y margen real con anticipos y documentos soporte.",
  },
  s08: {
    src: "/assets/08-gestion-documental.webp",
    width: 1795,
    height: 876,
    alt: "Historia documental del cliente con anexos, tamaño, responsable y fecha de cada archivo.",
  },
} as const;

const STAGES: Stage[] = [
  {
    id: "fragmentacion",
    section: "problema",
    kicker: "Fuentes dispersas",
    title: "La información vive fuera del proceso",
    body: "Excel, correos, WhatsApp, llamadas y carpetas separadas obligan al equipo a buscar, repetir y verificar información antes de poder actuar.",
    hotspot: "Cada fuente exige una verificación previa",
    visual: { kind: "nodes" },
  },
  {
    id: "centraliza",
    section: "transformacion",
    kicker: "Centraliza",
    title: "Un solo lugar para el cliente y su actividad",
    body: "Empresa, funnel, etapa, actividades y responsables quedan en un mismo registro consultable por el equipo.",
    hotspot: "Empresa, funnel y etapa en un registro",
    visual: { kind: "shot", ...SHOTS.s02 },
  },
  {
    id: "continuidad",
    section: "transformacion",
    kicker: "Da continuidad",
    title: "Cada movimiento queda trazado",
    body: "Llamadas, reuniones, notas y cambios de etapa se registran con fecha, hora y autor, sin reconstruir el historial.",
    hotspot: "Trazabilidad comercial con fecha y autor",
    visual: { kind: "shot", ...SHOTS.s03, zoom: true },
  },
  {
    id: "controla",
    section: "transformacion",
    kicker: "Controla",
    title: "El estado real, sin pedir reportes",
    body: "La misma información acompaña el trabajo comercial, operativo y documental, así el control deja de depender de consolidados manuales.",
    hotspot: "Un estado compartido por toda la operación",
    visual: { kind: "shot", ...SHOTS.s02 },
  },
  {
    id: "prospecto",
    section: "flujo",
    kicker: "01 · Prospecto y actividad",
    title: "La oportunidad nace con contexto",
    body: "El prospecto avanza en el funnel y cada interacción queda registrada en su propio timeline.",
    hotspot: "Funnel y actividad del prospecto",
    visual: { kind: "shot", ...SHOTS.s02 },
  },
  {
    id: "do",
    section: "flujo",
    kicker: "02 · Seguimiento del DO",
    title: "La operación se sigue por pasos",
    body: "Radicación, booking, cierre documental, ETD y ETA se completan en orden dentro de la misma operación.",
    hotspot: "Pasos de la operación en secuencia",
    visual: { kind: "shot", ...SHOTS.s04 },
  },
  {
    id: "tareas",
    section: "flujo",
    kicker: "03 · Tareas operativas",
    title: "El avance es verificable",
    body: "El checklist muestra qué está hecho y qué falta, con el conteo de actividades siempre visible.",
    hotspot: "Checklist con avance sobre el total",
    visual: { kind: "shot", ...SHOTS.s05 },
  },
  {
    id: "documental",
    section: "flujo",
    kicker: "04 · Gestión documental",
    title: "Los soportes acompañan al caso",
    body: "Los anexos quedan asociados al cliente y a la operación, con responsable y fecha de carga.",
    hotspot: "Anexos asociados al cliente",
    visual: { kind: "shot", ...SHOTS.s08 },
  },
  {
    id: "costos",
    section: "flujo",
    kicker: "05 · Costos reales y presupuestados",
    title: "El costo se compara línea por línea",
    body: "Cada servicio muestra su costo presupuestado y su costo real en la moneda de la operación.",
    hotspot: "Presupuestado frente a real por servicio",
    visual: { kind: "shot", ...SHOTS.s06 },
  },
  {
    id: "margen",
    section: "flujo",
    kicker: "06 · Margen y anticipos",
    title: "El margen real cierra el recorrido",
    body: "Margen presupuestado, margen real, anticipos y documentos soporte quedan en la misma vista.",
    hotspot: "Margen real y anticipos de la operación",
    visual: { kind: "shot", ...SHOTS.s07 },
  },
];

const SECTION_HEADS: Record<
  Stage["section"],
  { eyebrow: string; heading: string; lead?: string }
> = {
  problema: {
    eyebrow: "El costo de una operación fragmentada",
    heading: "El problema no es mover la carga. Es coordinar una operación fragmentada.",
    lead: "Excel, correos, WhatsApp, llamadas y carpetas separadas obligan al equipo a buscar, repetir y verificar información antes de poder actuar.",
  },
  transformacion: {
    eyebrow: "La transformación Logixtic",
    heading: "Una sola información acompaña el trabajo comercial, operativo y documental.",
  },
  flujo: {
    eyebrow: "Así fluye una operación",
    heading: "De la oportunidad comercial al margen real, sin perder el contexto.",
  },
};

const NODES = [
  "Excel",
  "Correo",
  "WhatsApp",
  "Llamadas",
  "Carpetas",
  "Notas sueltas",
];

function NodeCanvas() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-6 bg-mist px-5 py-8 sm:px-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {NODES.map((n) => (
          <div
            key={n}
            className="rounded-lg border border-neutralbrand/30 bg-white px-3 py-3 font-ui text-xs text-neutralbrand sm:text-sm"
          >
            <span className="mb-2 block h-px w-6 bg-neutralbrand/50" aria-hidden="true" />
            {n}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2" aria-hidden="true">
        <span className="h-8 w-px bg-neutralbrand/40" />
        <span className="font-ui text-[11px] tracking-[0.18em] text-neutralbrand uppercase">
          convergen en
        </span>
      </div>
      <div className="mx-auto rounded-xl bg-night px-6 py-4 text-center">
        <span className="font-display text-base font-semibold text-white sm:text-lg">Logixtic</span>
        <span className="mt-1 block font-ui text-xs text-white/70">
          Una operación, una sola información
        </span>
      </div>
    </div>
  );
}

function ProductFrame({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutralbrand/20 bg-white shadow-frame">
      <div className="flex items-center gap-2 border-b border-neutralbrand/15 bg-mist px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-royal/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber/80" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-orangebrand/70" aria-hidden="true" />
        <span className="ml-2 font-ui text-xs text-neutralbrand">Logixtic</span>
      </div>
      <div className="relative aspect-[16/9] w-full bg-mist">
        {STAGES.map((stage, i) => {
          const active = i === activeIndex;
          if (stage.visual.kind === "nodes") {
            return (
              <div
                key={stage.id}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-350 ${
                  active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <NodeCanvas />
              </div>
            );
          }
          const shot = stage.visual;
          return (
            <img
              key={stage.id}
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              loading="lazy"
              decoding="async"
              aria-hidden={!active}
              className={`absolute inset-0 h-full w-full object-contain transition-all duration-350 ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              } ${shot.zoom ? "motion-safe:scale-[1.06]" : ""}`}
            />
          );
        })}
      </div>
      <div className="border-t border-neutralbrand/15 bg-white px-4 py-3">
        <p className="font-ui text-xs text-night sm:text-sm">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-royal" aria-hidden="true" />
          {STAGES[activeIndex]?.hotspot}
        </p>
      </div>
    </div>
  );
}

function MobileShot({ stage }: { stage: Stage }) {
  if (stage.visual.kind === "nodes") {
    return (
      <div className="mt-5 overflow-hidden rounded-xl border border-neutralbrand/20 bg-white">
        <NodeCanvas />
      </div>
    );
  }
  const shot = stage.visual;
  return (
    <figure className="mt-5 overflow-hidden rounded-xl border border-neutralbrand/20 bg-white shadow-frame">
      <div className="aspect-[4/3] w-full overflow-hidden bg-mist">
        <img
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-left-top"
        />
      </div>
      <figcaption className="border-t border-neutralbrand/15 px-4 py-3 font-ui text-xs text-neutralbrand">
        {stage.hotspot}
      </figcaption>
    </figure>
  );
}

export function Journey() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const index = Number((visible.target as HTMLElement).dataset["index"]);
          if (!Number.isNaN(index)) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.6, 1] },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  let renderedSections: Stage["section"][] = [];

  return (
    <section id="plataforma" className="bg-white">
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-24">
        <div className="lg:grid lg:grid-cols-[40%_60%] lg:items-start lg:gap-12">
          {/* Narrativa */}
          <div>
            {STAGES.map((stage, i) => {
              const head = renderedSections.includes(stage.section)
                ? null
                : SECTION_HEADS[stage.section];
              if (head) renderedSections = [...renderedSections, stage.section];

              return (
                <div key={stage.id}>
                  {head ? (
                    <div className={i === 0 ? "" : "mt-20 lg:mt-32"}>
                      <p className="font-ui text-[11px] font-semibold tracking-[0.16em] text-royal uppercase">
                        {head.eyebrow}
                      </p>
                      <h2 className="mt-3 font-display text-2xl leading-tight font-semibold text-night md:text-[2rem]">
                        {head.heading}
                      </h2>
                      {head.lead ? (
                        <p className="mt-4 font-ui text-base leading-relaxed text-neutralbrand">
                          {head.lead}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div
                    data-index={i}
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    className="scroll-mt-28 border-l-2 border-mist pl-5 py-6 mt-6 transition-colors data-[on=true]:border-royal lg:min-h-[46vh] lg:py-10"
                    data-on={active === i}
                  >
                    <p className="font-ui text-[11px] font-semibold tracking-[0.14em] text-royal uppercase">
                      {stage.kicker}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-night md:text-xl">
                      {stage.title}
                    </h3>
                    <p className="mt-2 max-w-md font-ui text-sm leading-relaxed text-neutralbrand md:text-base">
                      {stage.body}
                    </p>
                    <div className="lg:hidden">
                      <MobileShot stage={stage} />
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="mt-10 rounded-xl bg-mist px-5 py-4 font-ui text-sm text-neutralbrand">
              Portal de Clientes es el siguiente nodo del recorrido y se aborda más adelante.
            </p>
          </div>

          {/* Canvas de producto sticky */}
          <div className="hidden lg:sticky lg:top-[100px] lg:block">
            <ProductFrame activeIndex={active} />
            <div className="mt-5">
              <div
                role="progressbar"
                aria-label="Avance del recorrido de la operación"
                aria-valuemin={1}
                aria-valuemax={STAGES.length}
                aria-valuenow={active + 1}
                aria-valuetext={`Etapa ${active + 1} de ${STAGES.length}: ${STAGES[active]?.kicker ?? ""}`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-mist"
              >
                <div
                  className="h-full rounded-full bg-royal transition-[width] duration-300"
                  style={{ width: `${((active + 1) / STAGES.length) * 100}%` }}
                />
              </div>
              <p className="mt-2 font-ui text-xs text-neutralbrand">
                Etapa {active + 1} de {STAGES.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
