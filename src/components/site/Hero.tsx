import { useEffect, useRef } from "react";
import { ArrowRight, Cog, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/site/DemoButton";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { WHATSAPP_URL, whatsappCopy } from "@/lib/whatsapp";
import globeAsset from "@/assets/closing-globe.webp.asset.json";

export function Hero() {
  const { content, locale } = useLanguage();
  const { hero } = content;
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
      <div className="hero-content relative z-10 mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 pt-28 pb-16 md:px-8 md:pt-32 md:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8">
        <div className="hero-copy flex flex-col items-start text-left">
          <p className="hero-reveal hero-delay-1 font-ui text-[11px] font-semibold tracking-[0.18em] text-skybrand uppercase md:text-xs">
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="hero-reveal hero-delay-2 mt-5 font-display text-[2.4rem] leading-[1.07] font-semibold text-on-dark sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]"
          >
            {hero.title[0]}
            <span className="block text-skybrand">{hero.title[1]}</span>
          </h1>
          <p className="hero-reveal hero-delay-3 mt-6 max-w-xl font-ui text-base leading-relaxed text-on-dark/72">
            {hero.body}
          </p>
          <div className="hero-reveal hero-delay-3 mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <DemoButton sectionId="hero" size="lg" className="w-full sm:w-auto" href={WHATSAPP_URL} ariaLabel={whatsappCopy[locale].heroLabel} />
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

        <div className="hero-visual hero-reveal hero-delay-3" aria-hidden="true">
          <div className="hero-visual-glow" />
          <div className="hero-visual-globe-wrap">
            <img
              className="hero-visual-globe"
              src={globeAsset.url}
              alt=""
              width={680}
              height={388}
              loading="lazy"
            />
            <div className="hero-visual-light" />
          </div>
          <svg className="hero-visual-links" viewBox="0 0 640 560" preserveAspectRatio="xMidYMid meet">
            <g className="hero-link-bases">
              <path d="M100 208 C110 260 140 310 205 348" />
              <path d="M320 158 C318 210 322 260 320 312" />
              <path d="M540 222 C530 270 500 315 445 350" />
            </g>
            <g className="hero-link-dots">
              <circle className="hero-link-dot hero-link-dot-1" r="3.2" />
              <circle className="hero-link-dot hero-link-dot-2" r="2.8" />
              <circle className="hero-link-dot hero-link-dot-3" r="3" />
            </g>
          </svg>
          <div className="hero-panel hero-panel-indicators">
            <span className="hero-panel-label">{hero.panels.indicators}</span>
            <svg className="hero-panel-chart" viewBox="0 0 120 64">
              <defs>
                <linearGradient id="hero-chart-bar" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="var(--color-royal)" />
                  <stop offset="100%" stopColor="var(--color-skybrand)" />
                </linearGradient>
              </defs>
              <g className="hero-chart-bars">
                <rect x="6" y="40" width="12" height="18" rx="2" />
                <rect x="26" y="32" width="12" height="26" rx="2" />
                <rect x="46" y="36" width="12" height="22" rx="2" />
                <rect x="66" y="24" width="12" height="34" rx="2" />
                <rect x="86" y="14" width="12" height="44" rx="2" />
              </g>
              <polyline className="hero-chart-trend" points="10,36 32,28 52,31 72,19 96,8" />
              <path className="hero-chart-trend" d="M96 8 l-7 1.4 M96 8 l-1.2 7" />
            </svg>
          </div>
          <div className="hero-panel hero-panel-automation">
            <span className="hero-panel-icon"><Cog /></span>
            <span className="hero-panel-label">{hero.panels.automation}</span>
          </div>
          <div className="hero-panel hero-panel-docs">
            <span className="hero-panel-icon"><FileCheck2 /></span>
            <span className="hero-panel-label">{hero.panels.docs}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
