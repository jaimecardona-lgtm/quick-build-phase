import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/site/DemoButton";
import { hero } from "@/lib/content";
import { track } from "@/lib/analytics";

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="hero-shell relative isolate overflow-hidden"
    >
      <div className="hero-layer" aria-hidden="true">
        <svg className="hero-routes" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice">
          <path
            className="route-line"
            d="M-60 520 C260 400 420 600 720 440 S1120 200 1500 300"
          />
          {[
            [140, 470],
            [420, 470],
            [720, 440],
            [1010, 300],
            [1300, 262],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} className="map-node" cx={cx} cy={cy} r="3.5" />
          ))}
        </svg>
      </div>
      <div className="hero-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-12 px-5 pt-28 pb-20 md:px-8 md:pt-32 md:pb-28 lg:grid-cols-12 lg:gap-14 lg:pt-36 lg:pb-32">
        <div className="lg:col-span-5">
          <p className="hero-reveal hero-delay-1 font-ui text-[11px] font-semibold tracking-[0.18em] text-skybrand uppercase md:text-xs">
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="hero-reveal hero-delay-2 mt-5 font-display text-[2.4rem] leading-[1.07] font-semibold text-on-dark sm:text-5xl lg:text-[3.5rem]"
          >
            {hero.title[0]}
            <span className="block text-skybrand">{hero.title[1]}</span>
          </h1>
          <p className="hero-reveal hero-delay-3 mt-6 max-w-xl font-ui text-base leading-relaxed text-on-dark/72">
            {hero.body}
          </p>
          <div className="hero-reveal hero-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <DemoButton sectionId="hero" size="lg" className="w-full sm:w-auto" />
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group min-h-12 w-full rounded-md border-on-dark/25 bg-on-dark/5 px-5 text-on-dark shadow-none hover:bg-on-dark/10 hover:text-on-dark sm:w-auto"
            >
              <a
                href="#plataforma"
                onClick={() => track("secondary_cta_click", { section_id: "hero" })}
              >
                {hero.secondaryCta}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>
        </div>

        <div className="hero-reveal hero-delay-4 relative lg:col-span-7">
          <div className="product-glow" aria-hidden="true" />
          <figure className="product-frame relative">
            <div className="flex h-10 items-center justify-between border-b border-on-dark/10 px-4">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-skybrand" />
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                <span className="h-1.5 w-1.5 rounded-full bg-on-dark/30" />
              </div>
              <span className="font-ui text-[10px] tracking-[0.16em] text-on-dark/55 uppercase">
                Logixtic®
              </span>
            </div>
            <img
              src={hero.image}
              alt={hero.imageAlt}
              width={1836}
              height={857}
              fetchPriority="high"
              decoding="async"
              className="block h-auto w-full object-contain"
            />
          </figure>
          <p className="status-card">
            <span aria-hidden="true" /> Información centralizada
          </p>
        </div>
      </div>
    </section>
  );
}
