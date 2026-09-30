import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/site/DemoButton";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import controlCenterAsset from "@/assets/logixtic-control-center.png.asset.json";

export function Hero() {
  const { content } = useLanguage();
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
      <div className="hero-scene" aria-hidden="true">
        <img
          className="hero-bg-photo"
          src={controlCenterAsset.url}
          alt=""
          width={1672}
          height={941}
          fetchPriority="high"
        />
      </div>

      <div className="hero-content relative z-10 mx-auto flex max-w-[1050px] flex-col items-center justify-center px-5 pt-28 pb-16 text-center md:px-8 md:pt-32 md:pb-20">
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
        <p className="hero-reveal hero-delay-3 mx-auto mt-6 max-w-xl font-ui text-base leading-relaxed text-on-dark/72">
          {hero.body}
        </p>
        <div className="hero-reveal hero-delay-3 mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
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
    </section>
  );
}
