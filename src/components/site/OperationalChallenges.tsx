import { useEffect, useRef } from "react";
import { TrendingDown, Users, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { FORWARDERS_V2, PRODUCT_SCREENS } from "@/lib/cinematic-assets";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";
import "./operational-challenges-zenox.css";

const icons = [TrendingDown, Users, FileSpreadsheet];

/*
 * variant "legacy" (por defecto): sin cambios; es el control de regresión de legacy-home.
 * variant "zenox": fondo cinematográfico (fondo2 del kit) en .oc-bg; sustituye el degradado de fotografía y la red
 * punteada de dispersión solo en la Home Zenox. Textos, tarjetas y captura del software no cambian.
 */
export function OperationalChallenges({ variant = "legacy" }: { variant?: "legacy" | "zenox" } = {}) {
  const { content } = useLanguage();
  const { challenges } = content;
  const zenox = variant === "zenox";
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!zenox || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      el.style.setProperty("--oc-p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [zenox]);

  return (
    <section
      ref={sectionRef}
      id="desafios-operativos"
      aria-labelledby="challenges-title"
      className={zenox ? "operational-challenges oc-zenox" : "operational-challenges"}
    >
      {zenox ? (
        <div className="oc-bg" aria-hidden="true">
          <div className="oc-bg-base" />
          <div className="oc-bg-par">
            <div className="oc-bg-img" />
          </div>
        </div>
      ) : null}
      {!zenox && FORWARDERS_V2 ? <div className="scene-photo scene-photo-carrusel" aria-hidden="true" /> : null}
      {!zenox && FORWARDERS_V2 ? <DataNetworkLayer variant="dispersion" /> : null}
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item challenge-heading">
          <p className="section-kicker">{challenges.kicker}</p>
          <h2 id="challenges-title" className="section-title-dark mt-4">{challenges.title}</h2>
        </div>
        <div className="challenge-list">
          {challenges.challenges.map((challenge, index) => {
            const Icon = icons[index] ?? FileSpreadsheet;
            return (
              <article key={index} data-reveal tabIndex={0} className="challenge-card reveal-item focus-ring" aria-labelledby={`challenge-${index + 1}`}>
                <span className="challenge-icon" aria-hidden="true"><Icon /></span>
                <h3 id={`challenge-${index + 1}`} className="title-h3 text-on-dark">{challenge.title}</h3>
                <p>{challenge.body}</p>
              </article>
            );
          })}
        </div>
        {FORWARDERS_V2 ? (
          <figure className="oc-product" aria-hidden="true">
            <img src={PRODUCT_SCREENS.overview} alt="" loading="lazy" decoding="async" />
          </figure>
        ) : null}
      </div>
    </section>
  );
}
