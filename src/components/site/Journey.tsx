import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, Box, MapPin, Ship, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoUrl } from "@/hooks/use-demo-url";

const productStages = [
  { label: "Comercial", title: "Cada oportunidad nace con contexto", body: "Empresa, funnel, etapa, actividades y responsables quedan en un mismo registro.", image: "/assets/02-gestion-comercial-resumen.webp", alt: "Resumen comercial en Logixtic con actividad, funnel y etapa del prospecto." },
  { label: "Operaciones", title: "El estado real, sin pedir reportes", body: "Radicación, booking, cierre documental, ETD y ETA se siguen paso a paso.", image: "/assets/04-seguimiento-operativo-pasos.webp", alt: "Seguimiento de una operación de carga por pasos en Logixtic." },
  { label: "Tareas", title: "El avance es verificable", body: "El checklist muestra qué está hecho y qué falta en cada operación.", image: "/assets/05-seguimiento-operativo-tareas.webp", alt: "Checklist de tareas operativas de un DO en Logixtic." },
  { label: "Documentos", title: "Los soportes acompañan al caso", body: "Cada anexo conserva responsable, fecha y relación con el cliente y la operación.", image: "/assets/08-gestion-documental.webp", alt: "Historia documental de un cliente dentro de Logixtic." },
  { label: "Rentabilidad", title: "El margen real cierra el recorrido", body: "Costos presupuestados, costos reales, anticipos y margen se consultan en la operación.", image: "/assets/07-rentabilidad-margen.webp", alt: "Vista de margen presupuestado y margen real en Logixtic." },
];

const fragments = ["Cliente", "Comercial", "Operaciones", "Documentos", "Carga", "Proveedor", "Información"];

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.setAttribute("data-visible", "true")),
      { threshold: 0.14, rootMargin: "0px 0px -8%" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function Fragmentation() {
  return (
    <section id="operacion" className="relative overflow-hidden bg-mist py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div data-reveal className="reveal-item mx-auto max-w-3xl text-center">
          <p className="section-kicker">El costo de una operación fragmentada</p>
          <h2 className="section-title mt-4">Tu operación no debería vivir <span className="text-royal">fragmentada.</span></h2>
          <p className="section-lead mx-auto mt-5">Excel, correos, WhatsApp, llamadas y carpetas separadas obligan al equipo a buscar, repetir y verificar información antes de actuar.</p>
        </div>
        <div data-reveal className="fragment-map reveal-item mt-16 md:mt-20">
          <svg viewBox="0 0 1000 420" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {[[115,95],[500,62],[875,106],[170,318],[500,345],[835,315],[500,205]].map(([x,y], index) => (
              index < 6 ? <path key={`${x}-${y}`} d={`M ${x} ${y} Q 500 ${index % 2 ? 120 : 290} 500 205`} className={`fragment-line fragment-line-${index + 1}`} /> : null
            ))}
          </svg>
          {fragments.map((label, index) => (
            <div key={label} className={`fragment-node fragment-node-${index + 1}`}>{label}</div>
          ))}
          <div className="fragment-core">
            <img src="/assets/logixtic-logo-negativo-transparente.png" alt="Logixtic" width={1520} height={465} />
            <span>Una sola información</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Platform() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number((visible.target as HTMLElement).dataset["stage"]);
      if (!Number.isNaN(index)) setActive(index);
    }, { rootMargin: "-35% 0px -35%", threshold: [0.1, 0.5, 0.8] });
    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="plataforma" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">La transformación Logixtic</p>
          <h2 className="section-title mt-4">Una plataforma. <span className="text-royal">Toda la operación.</span></h2>
          <p className="section-lead mt-5">La misma información acompaña el trabajo comercial, operativo y documental, desde la oportunidad hasta el margen real.</p>
        </div>
        <div className="mt-16 lg:grid lg:grid-cols-[minmax(0,35%)_minmax(0,1fr)] lg:gap-14">
          <div>
            {productStages.map((stage, index) => (
              <article key={stage.label} ref={(node) => { refs.current[index] = node; }} data-stage={index} data-on={active === index} className="platform-step border-l border-border py-8 pl-6 lg:min-h-[40vh] lg:py-12">
                <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-royal">{String(index + 1).padStart(2, "0")} · {stage.label}</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-night md:text-2xl">{stage.title}</h3>
                <p className="mt-3 max-w-sm font-ui text-sm leading-relaxed text-neutralbrand md:text-base">{stage.body}</p>
                <img src={stage.image} alt={stage.alt} loading="lazy" className="mt-6 rounded-md border border-border lg:hidden" />
              </article>
            ))}
          </div>
          <div className="hidden lg:sticky lg:top-28 lg:block lg:h-fit">
            <div className="product-stage relative overflow-hidden rounded-lg border border-border bg-mist shadow-product">
              <div className="flex h-11 items-center justify-between border-b border-border bg-background px-4">
                <div className="flex gap-1.5" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-royal" /><span className="h-2 w-2 rounded-full bg-amber" /><span className="h-2 w-2 rounded-full bg-neutralbrand/40" /></div>
                <span className="font-ui text-[10px] uppercase tracking-[0.16em] text-neutralbrand">Logixtic · {productStages[active]?.label}</span>
              </div>
              <div className="relative aspect-[2/1]">
                {productStages.map((stage, index) => <img key={stage.image} src={stage.image} alt={stage.alt} loading="lazy" className={`absolute inset-0 h-full w-full object-contain transition-all duration-700 ${active === index ? "scale-100 opacity-100" : "scale-[0.985] opacity-0"}`} />)}
              </div>
              <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-md border border-border bg-background/92 px-3 py-2 font-ui text-xs text-night shadow-tag backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-royal" /> Información sincronizada</div>
            </div>
            <div className="mt-4 flex items-center justify-between font-ui text-xs text-neutralbrand"><span>{productStages[active]?.label}</span><span>{active + 1} / {productStages.length}</span></div>
            <div className="mt-2 h-px bg-border"><div className="h-px bg-royal transition-[width] duration-500" style={{ width: `${((active + 1) / productStages.length) * 100}%` }} /></div>
          </div>
        </div>
        <p className="mt-10 border-l-2 border-amber pl-4 font-ui text-sm text-neutralbrand">El Portal de Clientes extiende la visibilidad de la operación hacia el cliente.</p>
      </div>
    </section>
  );
}

function FreightJourney() {
  const stops = [
    { name: "Origen", detail: "Cotización", Icon: Box },
    { name: "Operación", detail: "Coordinación", Icon: Truck },
    { name: "Tránsito", detail: "Tracking", Icon: Ship },
    { name: "Destino", detail: "Documentación", Icon: MapPin },
  ];
  return (
    <section id="freight-journey" className="relative overflow-hidden bg-night py-24 text-on-dark md:py-32">
      <div className="journey-grid" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker text-skybrand">Freight journey</p>
          <h2 className="section-title mt-4 text-on-dark">La carga avanza. <span className="text-skybrand">La información también.</span></h2>
          <p className="mt-5 max-w-2xl font-ui text-base leading-relaxed text-on-dark/65 md:text-lg">Origen, operación, tránsito y destino comparten una misma trazabilidad dentro de Logixtic.</p>
        </div>
        <div data-reveal className="reveal-item journey-route relative mt-20 grid grid-cols-2 gap-y-12 md:grid-cols-4 md:gap-6">
          <div className="journey-track" aria-hidden="true"><span /></div>
          {stops.map(({ name, detail, Icon }, index) => (
            <div key={name} className="relative z-10 flex flex-col items-center text-center">
              <div className="journey-stop"><Icon className="h-5 w-5" /></div>
              <p className="mt-5 font-display text-lg font-semibold">{name}</p>
              <p className="mt-1 font-ui text-sm text-on-dark/55">{detail}</p>
              <span className="mt-3 font-ui text-[10px] uppercase tracking-[0.16em] text-skybrand">0{index + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          <figure data-reveal className="reveal-item overflow-hidden rounded-lg border border-on-dark/12 bg-on-dark/5 p-2">
            <img src="/assets/06-costos-operacion.webp" alt="Comparación de costos presupuestados y reales por servicio en Logixtic." loading="lazy" className="rounded-md" />
          </figure>
          <figure data-reveal className="reveal-item overflow-hidden rounded-lg border border-on-dark/12 bg-on-dark/5 p-2 md:translate-y-10">
            <img src="/assets/03-gestion-comercial-timeline.webp" alt="Timeline de actividad comercial con registros fechados en Logixtic." loading="lazy" className="rounded-md" />
          </figure>
        </div>
      </div>
    </section>
  );
}

function Logix() {
  return (
    <section id="logix" className="bg-mist py-24 md:py-32">
      <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-5 md:px-8 lg:grid-cols-2">
        <div data-reveal className="reveal-item">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-night text-skybrand"><Bot className="h-5 w-5" /></div>
          <p className="section-kicker mt-7">Logix · Inteligencia sobre tu operación</p>
          <h2 className="section-title mt-4">Pregunta. Encuentra. <span className="text-royal">Actúa.</span></h2>
          <p className="section-lead mt-5">Pregúntale a Logix sobre la información de clientes, pedidos y operaciones que ya vive dentro de la plataforma.</p>
          <div className="mt-8 space-y-3 font-ui text-sm text-night">
            {["Consulta la información de un cliente", "Encuentra una operación", "Revisa la actividad registrada"].map((text) => <div key={text} className="flex items-center gap-3 border-b border-border pb-3"><ArrowRight className="h-4 w-4 text-royal" />{text}</div>)}
          </div>
        </div>
        <div data-reveal className="reveal-item relative">
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-product">
            <img src="/assets/02-gestion-comercial-resumen.webp" alt="Información comercial centralizada en la plataforma Logixtic." loading="lazy" className="w-full" />
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3 rounded-md border border-border bg-mist px-4 py-3 font-ui text-sm text-neutralbrand"><Bot className="h-4 w-4 shrink-0 text-royal" /><span>Pregúntale a Logix sobre tu operación…</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const demoUrl = useDemoUrl();
  return (
    <section className="final-cta relative isolate overflow-hidden bg-royal py-24 md:py-32">
      <div className="final-lines" aria-hidden="true" />
      <div data-reveal className="reveal-item relative z-10 mx-auto max-w-4xl px-5 text-center md:px-8">
        <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-on-dark/65">Una sola plataforma · una sola información</p>
        <h2 className="mt-5 font-display text-4xl leading-[1.08] font-semibold text-on-dark md:text-6xl">Tu operación puede funcionar como un solo sistema.</h2>
        <Button asChild size="lg" className="mt-9 min-h-12 rounded-md bg-amber px-7 font-semibold text-night shadow-signal hover:bg-amber/90"><a href={demoUrl} target="_blank" rel="noopener noreferrer">Demo Estratégica</a></Button>
      </div>
    </section>
  );
}

export function Journey() {
  useReveal();
  return <><Fragmentation /><Platform /><FreightJourney /><Logix /><FinalCta /></>;
}