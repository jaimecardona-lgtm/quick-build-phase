import { useDemoUrl } from "@/hooks/use-demo-url";

export function Hero() {
  const demoUrl = useDemoUrl();

  return (
    <section id="top" className="relative overflow-hidden bg-royal">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-5 pt-12 pb-14 md:px-8 lg:min-h-[calc(100vh-76px)] lg:grid-cols-12 lg:gap-8 lg:pt-8 lg:pb-10">
        <div className="anim-rise lg:col-span-5">
          <p className="font-ui text-[11px] font-semibold tracking-[0.16em] text-white/80 uppercase md:text-xs">
            Logixtic para Agentes de Carga Internacional
          </p>
          <h1 className="mt-4 font-display text-[2rem] leading-[1.1] font-semibold text-white md:text-[2.75rem] lg:text-[3rem]">
            Software para agentes de carga que conecta toda tu operación.
          </h1>
          <p className="mt-5 max-w-xl font-ui text-base leading-relaxed text-white/85 md:text-lg">
            Centraliza la gestión comercial, operativa, documental y de clientes, incorpora
            automatización e inteligencia artificial y trabaja con mayor control y rentabilidad.
          </p>
          <div className="anim-rise anim-delay-1 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-lg bg-amber px-6 font-ui text-[0.95rem] font-semibold text-night transition-colors hover:bg-amber/90"
            >
              Agenda una demo personalizada
            </a>
            <a
              href="#plataforma"
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-lg border border-white/50 px-6 font-ui text-[0.95rem] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Conoce la plataforma
            </a>
          </div>
        </div>

        <div className="anim-rise anim-delay-2 lg:col-span-7">
          <div className="relative">
            <div className="overflow-hidden rounded-xl bg-white shadow-frame ring-1 ring-white/25">
              <img
                src="/assets/01-plataforma-servicios-menu.webp"
                alt="Portafolio de servicios de Logixtic con el menú lateral de CRM y gestión operativa visible."
                width={1836}
                height={857}
                fetchPriority="high"
                decoding="async"
                className="block h-auto w-full object-contain"
              />
            </div>

            <span className="pointer-events-none absolute -top-3 left-4 hidden rounded-full bg-white px-3 py-1.5 font-ui text-xs font-semibold text-night shadow-tag md:inline-block">
              Operación conectada
            </span>
            <span className="pointer-events-none absolute -bottom-3 right-4 hidden rounded-full bg-night px-3 py-1.5 font-ui text-xs font-semibold text-white shadow-tag md:inline-block">
              Información centralizada
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
