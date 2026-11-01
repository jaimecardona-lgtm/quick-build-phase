import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CinematicBackgroundSequence } from "@/components/experience/CinematicBackgroundSequence";
import { DemoButton } from "@/components/site/DemoButton";
import { track } from "@/lib/analytics";
import { CINEMATIC_CLIPS } from "@/lib/cinematic-media";
import { FORWARDERS_V2, PRODUCT_SCREENS } from "@/lib/cinematic-assets";
import { SCENE_SECTIONS, imageSceneFor, videoClipsFor } from "@/lib/visual-scenes";
import { SceneStill } from "@/components/experience/SceneStill";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";
import { useLanguage } from "@/lib/i18n";
import { WHATSAPP_URL, whatsappCopy } from "@/lib/whatsapp";
import "@/components/experience/cinematic.css";

// Hero: operación portuaria real (barco) que se encadena con digitalización (escaneo). Sin tablet ni paneles flotantes.
// Sin scroll pinning: la sección tiene altura normal y la siguiente llega con el scroll habitual.
// V2: sin clips con personas (escaneo.mp4 muestra una persona hasta aprobación editorial).
const HERO_CLIPS = FORWARDERS_V2 ? videoClipsFor(SCENE_SECTIONS.hero) : [CINEMATIC_CLIPS.sea, CINEMATIC_CLIPS.scan];
// V2: el hero es solo imagen (digitalizacion.jpg), sin video encima.
const heroStill = FORWARDERS_V2 ? imageSceneFor(SCENE_SECTIONS.hero) : undefined;

export function CinematicHero() {
  const { content, locale } = useLanguage();
  const { hero } = content;

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="cinematic-hero hero-shell relative isolate overflow-x-clip"
    >
      <div className="cin-sticky">
        {heroStill ? (
          <SceneStill scene={heroStill} eager className="cin-plate-port" />
        ) : (
          <CinematicBackgroundSequence clips={HERO_CLIPS} priority className="cin-plate-port" />
        )}
        <div className="cin-scrim" aria-hidden="true" />
        {FORWARDERS_V2 ? <DataNetworkLayer variant="routes" /> : null}

        <div className="relative z-10 mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 pt-28 pb-16 md:px-8 md:pt-32 md:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
          <div className="hero-copy flex max-w-[860px] flex-col items-start text-left">
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
            <div className="cin-cta mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <DemoButton
                sectionId="hero"
                size="lg"
                className="w-full sm:w-auto"
                href={WHATSAPP_URL}
                ariaLabel={whatsappCopy[locale].heroLabel}
              />
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

          {/* Captura real del sistema demo de Logixtic: decorativa, no contenido nuevo. Solo escritorio. */}
          {FORWARDERS_V2 ? (
            <figure className="hero-product" aria-hidden="true">
              <div className="hero-product-frame">
                <img src={PRODUCT_SCREENS.overview} alt="" decoding="async" />
              </div>
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}
