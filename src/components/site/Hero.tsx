import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/site/DemoButton";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { WHATSAPP_URL, whatsappCopy } from "@/lib/whatsapp";
import controlCenterAsset from "@/assets/logixtic-control-center.png.asset.json";

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
      <div className="hero-scene" aria-hidden="true">
        <img
          className="hero-bg-photo"
          src={controlCenterAsset.url}
          alt=""
          width={1672}
          height={941}
          fetchPriority="high"
        />
        <svg
          className="hero-digital-layer"
          viewBox="0 0 1672 941"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g className="hero-route-bases">
            <path d="M-24 342 C92 363 112 426 222 438 C314 448 343 427 432 474 C461 489 487 495 523 497" />
            <path d="M-18 365 C92 385 130 449 235 457 C322 464 355 443 443 485 C473 500 500 503 538 505" />
            <path d="M-12 389 C102 405 142 467 246 476 C337 484 376 458 459 496 C487 509 520 513 554 513" />
            <path d="M914 521 C1001 514 1033 474 1115 455 C1207 434 1248 457 1326 469 C1426 486 1487 450 1696 387" />
            <path d="M902 536 C1004 529 1042 492 1123 472 C1201 453 1250 476 1329 486 C1433 499 1504 466 1694 414" />
            <path d="M936 501 C1007 488 1047 447 1120 431 C1204 413 1261 438 1339 449 C1438 463 1510 424 1692 367" />
            <path d="M2 33 C73 65 126 116 161 169 C184 204 194 231 203 264" />
            <path d="M1047 314 C1086 256 1137 219 1206 208 C1275 197 1309 156 1371 145 C1471 127 1546 171 1674 252" />
            <path d="M1071 346 C1117 293 1166 261 1233 249 C1300 237 1350 203 1410 196 C1513 184 1573 213 1681 279" />
            <path d="M132 0 L132 178 L273 178 L273 22" />
            <path d="M1062 22 L1062 378 L1115 378 L1115 0" />
          </g>

          <g className="hero-route-pulses">
            <path className="hero-pulse hero-pulse-blue hero-pulse-1" d="M-24 342 C92 363 112 426 222 438 C314 448 343 427 432 474 C461 489 487 495 523 497" />
            <path className="hero-pulse hero-pulse-yellow hero-pulse-2" d="M-12 389 C102 405 142 467 246 476 C337 484 376 458 459 496 C487 509 520 513 554 513" />
            <path className="hero-pulse hero-pulse-blue hero-pulse-3" d="M914 521 C1001 514 1033 474 1115 455 C1207 434 1248 457 1326 469 C1426 486 1487 450 1696 387" />
            <path className="hero-pulse hero-pulse-yellow hero-pulse-4" d="M936 501 C1007 488 1047 447 1120 431 C1204 413 1261 438 1339 449 C1438 463 1510 424 1692 367" />
            <path className="hero-pulse hero-pulse-blue hero-pulse-5 hero-signal-mobile-hide" d="M2 33 C73 65 126 116 161 169 C184 204 194 231 203 264" />
            <path className="hero-pulse hero-pulse-yellow hero-pulse-6 hero-signal-mobile-hide" d="M1047 314 C1086 256 1137 219 1206 208 C1275 197 1309 156 1371 145 C1471 127 1546 171 1674 252" />
          </g>

          <g className="hero-route-points">
            <circle className="hero-route-point hero-route-point-1" r="3.2" />
            <circle className="hero-route-point hero-route-point-2" r="2.7" />
            <circle className="hero-route-point hero-route-point-3 hero-signal-mobile-hide" r="3" />
            <circle className="hero-route-point hero-route-point-4 hero-signal-mobile-hide" r="2.6" />
          </g>
        </svg>
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
    </section>
  );
}
