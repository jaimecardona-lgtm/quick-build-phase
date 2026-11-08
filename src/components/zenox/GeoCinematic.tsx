import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { LogisticsRoutes } from "@/components/experience/LogisticsRoutes";
import { GlobalCoverage } from "@/components/experience/GlobalCoverage";
import { copy as presenceCopy } from "@/components/site/Evidence";
import { ZX_GEO } from "./zenox-copy";
import "./geo-cinematic.css";

/*
 * Escena de presencia y control global.
 * 1) Bloque de presencia regional en flujo normal: titular, mapa grande (ancho real 800–880 px en escritorio)
 *    y descripción completa. Se recorre con el scroll; nada de este bloque se fija ni se recorta.
 * 2) Escena fijada (sticky) de visión conectada: el globo (GlobalCoverage) crece y aparece, con su texto y la
 *    frase final. El progreso del scroll (0 → 1) controla solo esas capas.
 * Solo se escriben opacity y transform, en un único listener de scroll pasivo con requestAnimationFrame.
 * Con movimiento reducido todo es una secuencia estática.
 */

// Ubicaciones confirmadas de la presencia regional (mismas que Evidence en variante zenox).
const placesPresence = [
  { key: "miami", side: "t" },
  { key: "panama", side: "l" },
  { key: "colombia", side: "r" },
  { key: "ecuador", side: "l" },
] as const;
const highlightedPresence = new Set(["ECU", "COL", "PAN"]);

const ramp = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));

export function GeoCinematic() {
  const { locale, content } = useLanguage();
  const lang = locale.startsWith("pt") ? "pt" : locale.startsWith("en") ? "en" : "es";
  const t = presenceCopy[lang];
  const pinRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const textBRef = useRef<HTMLDivElement>(null);
  const textCRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Un bucle por frame mientras la escena está cerca del viewport: el progreso nunca queda desfasado tras un salto
    // de scroll o un cambio de layout. Solo escribe opacity y transform en tres capas.
    let raf = 0;
    const set = (el: HTMLElement | null, opacity: number, scale?: number) => {
      if (!el) return;
      el.style.opacity = opacity.toFixed(3);
      if (scale !== undefined) el.style.transform = `scale(${scale.toFixed(4)})`;
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const span = Math.max(1, pin.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -pin.getBoundingClientRect().top / span));
      // El globo aparece desde el inicio de la escena (mínimo 0.35) para que nunca quede un hueco oscuro.
      const gIn = ramp(p, 0, 0.45);
      set(globeRef.current, 0.35 + 0.65 * gIn, 0.8 + 0.2 * gIn);
      set(textBRef.current, ramp(p, 0.15, 0.4) * (1 - ramp(p, 0.8, 0.9)));
      set(textCRef.current, ramp(p, 0.8, 0.95));
      // El mapa aparece y desaparece como el globo: entra desde abajo (escala y opacidad) y se retira al salir por arriba.
      const map = mapRef.current;
      if (map) {
        const vh = window.innerHeight;
        const r = map.getBoundingClientRect();
        const enter = Math.min(1, Math.max(0, (vh - r.top) / (0.6 * vh)));
        const exit = Math.min(1, Math.max(0, r.bottom / (0.4 * vh)));
        const v = Math.min(enter, exit);
        set(map, 0.35 + 0.65 * v, 0.82 + 0.18 * v);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="clientes" className="geo-scene" aria-label={t.kicker}>
      <div className="geo-intro">
        <p className="section-kicker">{t.kicker}</p>
        <h2 className="geo-h2">{ZX_GEO.a.h2}</h2>
        <div ref={mapRef} className="geo-map">
          <LogisticsRoutes
            caption={t.presence}
            places={placesPresence}
            placeLabels={t.places}
            highlighted={highlightedPresence}
            mapLabel={content.ui.mapLabel}
            locale={locale}
            variant="zenox"
          />
          <p className="geo-band">{ZX_GEO.a.band}</p>
        </div>
      </div>

      <div ref={pinRef} className="geo-pin">
        <div className="geo-stage">
          <div className="geo-bg" aria-hidden="true">
            <div className="geo-glow geo-glow--a" />
            <div className="geo-glow geo-glow--b" />
          </div>

          <div ref={globeRef} className="geo-layer geo-globe">
            <GlobalCoverage variant="zenox" />
          </div>

          <div ref={textBRef} className="geo-text geo-text-b">
            <h2 className="geo-h2">{ZX_GEO.b.h2}</h2>
            <p className="geo-p">{ZX_GEO.b.p}</p>
          </div>

          <div ref={textCRef} className="geo-text geo-text-c">
            <p className="geo-h2 geo-h2--c">{ZX_GEO.c.p}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
