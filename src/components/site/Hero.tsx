import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/site/DemoButton";
import { hero } from "@/lib/content";
import { track } from "@/lib/analytics";
import logixAsset from "@/assets/logix1.jpeg.asset.json";

const routePoints = [
  [168, 424],
  [334, 350],
  [542, 392],
  [744, 286],
  [972, 214],
] as const;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = heroRef.current;
    if (!node || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset["active"] = entry?.isIntersecting ? "true" : "false";
      },
      { threshold: 0.16 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      id="inicio"
      aria-labelledby="hero-title"
      data-active="true"
      className="hero-shell relative isolate overflow-hidden"
    >
      <div className="hero-scene" aria-hidden="true">
        <div className="hero-port-depth hero-port-depth-a" />
        <div className="hero-port-depth hero-port-depth-b" />
        <svg className="hero-port-svg" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
          <g className="hero-horizon">
            <path d="M0 442 H1200" />
            <path d="M0 488 C240 474 422 512 634 491 S1008 462 1200 482" />
          </g>
          <g className="port-layer port-layer-back">
            <path className="port-crane" d="M682 430 V190 L784 430 M682 190 L590 260 M682 190 H836 L884 238" />
            <path className="port-crane" d="M888 424 V150 L1028 424 M888 150 L790 236 M888 150 H1065 L1118 215" />
            <path className="port-crane" d="M1036 438 V246 L1130 438 M1036 246 L962 318 M1036 246 H1170" />
          </g>
          <g className="container-stack container-stack-a">
            <rect className="container container-a" x="788" y="408" width="74" height="28" rx="2" />
            <rect className="container container-b" x="866" y="408" width="82" height="28" rx="2" />
            <rect className="container container-c" x="950" y="408" width="68" height="28" rx="2" />
            <rect className="container container-b" x="826" y="376" width="82" height="28" rx="2" />
            <rect className="container container-a" x="912" y="376" width="74" height="28" rx="2" />
            <rect className="container container-c" x="886" y="344" width="86" height="28" rx="2" />
          </g>
          <g className="hero-ship">
            <path className="ship-body" d="M640 498 H1090 L1047 562 H696 C670 545 652 525 640 498Z" />
            <rect className="container container-a" x="705" y="444" width="78" height="42" rx="2" />
            <rect className="container container-b" x="789" y="444" width="82" height="42" rx="2" />
            <rect className="container container-c" x="877" y="444" width="82" height="42" rx="2" />
            <rect className="container container-a" x="963" y="444" width="74" height="42" rx="2" />
            <rect className="container container-b" x="748" y="397" width="78" height="42" rx="2" />
            <rect className="container container-c" x="832" y="397" width="82" height="42" rx="2" />
            <rect className="container container-a" x="920" y="397" width="74" height="42" rx="2" />
            <path className="ship-bridge" d="M1034 398 H1118 L1144 498 H1034Z" />
          </g>
          <path className="hero-trace" d="M116 420 C302 312 472 390 604 318 S834 174 1098 208" />
          {routePoints.map(([cx, cy], index) => (
            <circle key={`${cx}-${cy}`} className={`trace-node trace-node-${index + 1}`} cx={cx} cy={cy} r="5" />
          ))}
          <g className="hero-plane">
            <path d="M828 126 L894 104 L876 132 L916 152 L904 164 L866 150 L846 178 L840 164 L852 142 Z" />
          </g>
        </svg>
        <div className="hero-water" />
      </div>
      <div className="hero-grid" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid min-h-[92vh] max-w-[1320px] grid-cols-1 items-center gap-12 px-5 pt-28 pb-16 md:px-8 md:pt-32 md:pb-20 lg:grid-cols-12 lg:gap-14">
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

        <div className="hero-reveal hero-delay-4 hero-product-wrap relative lg:col-span-7">
          <div className="product-glow" aria-hidden="true" />
          <figure className="product-frame hero-product-frame relative">
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
          <div className="hero-guide" aria-label="Logix consulta información registrada en la operación">
            <img src={logixAsset.url} alt="Logix" width={1024} height={1024} />
            <span>Logix consulta información registrada</span>
          </div>
          <p className="status-card">
            <span aria-hidden="true" /> Información centralizada
          </p>
        </div>
      </div>
    </section>
  );
}
