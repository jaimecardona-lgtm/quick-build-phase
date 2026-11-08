import { useEffect, useRef } from "react";
import "./zenox-orbs.css";

/*
 * Dos hologramas decorativos de la sección Capacidades (#servicios):
 *  - Dona (imagen con transparencia real) arriba a la izquierda.
 *  - Aro radial oscuro a la derecha.
 * Cada uno tiene tres capas, para que ninguna transformación sobrescriba a otra:
 *   .zx-orb         → seguimiento vertical del scroll (variable --zx-oy-*, en píxeles, limitada a la sección)
 *   .zx-orb-tilt    → inclinación ligada a la velocidad del scroll (variables --zx-orb-v)
 *   .zx-orb-body    → levitación y rotación automáticas (keyframes)
 * El scroll solo escribe variables CSS en la raíz: sin re-renders de React. Con movimiento reducido no hay seguimiento.
 */
const DONA_SRC = "/zenox-kit/decor/dona-transparente.webp";
// Recorrido por píxel de scroll: la dona avanza más deprisa que el aro (ritmos distintos).
// Factor sobre el recorrido máximo de cada objeto: ambos recorren de arriba a abajo la sección.
const FOLLOW = { dona: 1, ring: 1 } as const;
const MARGIN = 24; // margen mínimo con el borde inferior de la sección

export function ZenoxOrbs() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const section = root?.parentElement;
    if (!root || !section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        root.setAttribute("data-active", entry?.isIntersecting ? "true" : "false");
      },
      { threshold: 0 },
    );
    io.observe(section);
    root.setAttribute("data-active", "true");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => io.disconnect();
    }

    const dona = root.querySelector<HTMLElement>(".zx-orb--dona");
    const ring = root.querySelector<HTMLElement>(".zx-orb--ring");

    // Ascensor: el progreso del scroll a través de la sección (0 al entrar, 1 al salir) recorre toda la altura útil
    // de cada objeto. Así la dona baja de arriba a abajo mientras avanzas por Capacidades, y sube al volver.
    const follow = () => {
      if (root.getAttribute("data-active") !== "true") return;
      const sr = section.getBoundingClientRect();
      const range = Math.max(1, section.offsetHeight - window.innerHeight); // recorrido de scroll útil de la sección
      const progress = Math.min(1, Math.max(0, -sr.top / range));
      const sectionH = section.offsetHeight;
      const place = (el: HTMLElement | null, factor: number, varName: string) => {
        if (!el) return;
        const maxTravel = Math.max(0, sectionH - el.offsetTop - el.offsetHeight - MARGIN);
        root.style.setProperty(varName, (progress * maxTravel * factor).toFixed(1));
      };
      place(dona, FOLLOW.dona, "--zx-oy-dona");
      place(ring, FOLLOW.ring, "--zx-oy-ring");
    };

    // Un único bucle por frame mientras la sección es visible: el seguimiento nunca se queda con un valor antiguo
    // (p. ej. tras un salto de scroll o cuando el layout cambia al cargar imágenes). Solo escribe variables CSS.
    let raf = 0;
    let lastY = window.scrollY;
    let v = 0; // velocidad suavizada del scroll (-1..1): inclina al bajar, inverso al subir
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (root.getAttribute("data-active") !== "true") return;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      const target = Math.max(-1, Math.min(1, dy / 30));
      v += (target - v) * 0.14;
      if (Math.abs(v) < 0.002 && target === 0) v = 0;
      follow();
      root.style.setProperty("--zx-orb-v", v.toFixed(3));
    };
    raf = requestAnimationFrame(tick);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="zx-orbs" data-active="true" aria-hidden="true">
      <div className="zx-orb zx-orb--dona">
        <div className="zx-orb-tilt">
          <div className="zx-orb-body">
            <img src={DONA_SRC} alt="" width={2048} height={1365} decoding="async" loading="lazy" />
            <span className="zx-orb-glow" />
          </div>
        </div>
      </div>
      <div className="zx-orb zx-orb--ring">
        <div className="zx-orb-tilt">
          <div className="zx-orb-body" />
        </div>
      </div>
    </div>
  );
}
