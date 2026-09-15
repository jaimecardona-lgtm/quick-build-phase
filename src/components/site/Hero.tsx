import { ArrowDown, Plane, Ship, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoUrl } from "@/hooks/use-demo-url";

function WorldRoutes() {
  return (
    <div className="hero-world" aria-hidden="true">
      <div className="hero-orbit hero-orbit-a" />
      <div className="hero-orbit hero-orbit-b" />
      <svg className="hero-routes" viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice">
        <path className="route-line route-line-a" d="M-80 555 C220 390 330 625 625 445 S1000 155 1530 265" />
        <path className="route-line route-line-b" d="M120 60 C335 310 560 175 780 335 S1160 650 1510 505" />
        <path className="route-line route-line-c" d="M-40 265 C260 170 390 390 700 260 S1110 90 1480 125" />
        {[
          [125, 474], [320, 472], [514, 505], [715, 380], [925, 240], [1135, 210], [1308, 224],
          [205, 135], [435, 224], [690, 275], [902, 428], [1102, 555], [1314, 545],
        ].map(([cx, cy], index) => (
          <circle key={`${cx}-${cy}`} className={`map-node map-node-${(index % 3) + 1}`} cx={cx} cy={cy} r="4" />
        ))}
      </svg>
      <div className="cargo-marker cargo-ship"><Ship /></div>
      <div className="cargo-marker cargo-plane"><Plane /></div>
      <div className="cargo-marker cargo-truck"><Truck /></div>
      <div className="data-pulse data-pulse-a" />
      <div className="data-pulse data-pulse-b" />
      <div className="data-pulse data-pulse-c" />
    </div>
  );
}

export function Hero() {
  const demoUrl = useDemoUrl();

  return (
    <section id="top" className="hero-shell relative isolate overflow-hidden bg-night">
      <WorldRoutes />
      <div className="hero-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid min-h-[calc(94svh-72px)] max-w-[1360px] grid-cols-1 content-center gap-9 px-5 pt-12 pb-9 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pt-8">
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="hero-reveal hero-delay-1 flex items-center gap-3 font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-skybrand md:text-xs">
            <span className="inline-flex h-2 w-2 rounded-full bg-amber shadow-signal" />
            Tecnología para agentes de carga internacional
          </div>
          <h1 className="hero-reveal hero-delay-2 mt-5 max-w-3xl font-display text-[2.45rem] leading-[1.05] font-semibold text-on-dark sm:text-5xl lg:text-[4rem] xl:text-[4.5rem]">
            Toda tu operación de carga,
            <span className="block text-skybrand">conectada y bajo control.</span>
          </h1>
          <p className="hero-reveal hero-delay-3 mt-6 max-w-xl font-ui text-base leading-relaxed text-on-dark/72 md:text-lg">
            Centraliza la gestión comercial, operativa, documental y de clientes. Automatiza el
            trabajo y toma decisiones con información trazable.
          </p>
          <div className="hero-reveal hero-delay-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="min-h-12 rounded-md bg-amber px-6 font-semibold text-night shadow-signal hover:bg-amber/90">
              <a href={demoUrl} target="_blank" rel="noopener noreferrer">Demo Estratégica</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 rounded-md border-on-dark/25 bg-on-dark/5 px-6 text-on-dark shadow-none backdrop-blur-sm hover:bg-on-dark/10 hover:text-on-dark">
              <a href="#plataforma">Conoce la plataforma</a>
            </Button>
          </div>
          <div className="hero-reveal hero-delay-5 mt-10 flex items-center gap-5 font-ui text-xs text-on-dark/58">
            <span>Cotiza</span><span className="h-px w-5 bg-skybrand/60" /><span>Coordina</span>
            <span className="h-px w-5 bg-skybrand/60" /><span>Controla</span>
          </div>
        </div>

        <div className="hero-product hero-reveal hero-delay-4 relative lg:col-span-6 xl:col-span-7">
          <div className="product-glow" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-lg border border-on-dark/18 bg-on-dark/8 shadow-product backdrop-blur-sm">
            <div className="flex h-9 items-center justify-between border-b border-on-dark/12 px-4">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                <span className="h-1.5 w-1.5 rounded-full bg-skybrand" />
                <span className="h-1.5 w-1.5 rounded-full bg-on-dark/35" />
              </div>
              <span className="font-ui text-[10px] uppercase tracking-[0.16em] text-on-dark/55">Operación conectada</span>
            </div>
            <img
              src="/assets/01-plataforma-servicios-menu.webp"
              alt="Plataforma Logixtic con los módulos de gestión comercial y operación de carga."
              width={1836}
              height={857}
              fetchPriority="high"
              decoding="async"
              className="block h-auto w-full object-contain"
            />
          </div>
          <div className="hero-status hero-status-a"><span /> Seguimiento operativo</div>
          <div className="hero-status hero-status-b"><span /> Información centralizada</div>
        </div>
      </div>

      <a href="#operacion" aria-label="Continuar a la operación" className="focus-ring absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 text-on-dark/45 transition-colors hover:text-on-dark md:block">
        <ArrowDown className="h-5 w-5 animate-soft-bounce" />
      </a>
    </section>
  );
}