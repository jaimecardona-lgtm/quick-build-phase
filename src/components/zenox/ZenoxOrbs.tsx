import { useEffect, useRef } from "react";
import "./zenox-orbs.css";

/*
 * Dos objetos holográficos decorativos de la sección Capacidades (#servicios):
 *  - Dona (imagen con alfa) arriba a la izquierda.
 *  - Aro radial oscuro a la derecha.
 * Capas: .zx-orb (posición) > .zx-orb-tilt (reacción al scroll, variables CSS) > .zx-orb-body (flotación y rotación).
 * Las animaciones automáticas viven en .zx-orb-body; el scroll solo escribe variables en .zx-orbs. No se
 * sobrescriben transformaciones entre sí. Pausa fuera de pantalla y no hace nada con movimiento reducido.
 */
const DONA_SRC = "/zenox-kit/decor/dona-transparente.webp";

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

    let raf = 0;
    let lastY = window.scrollY;
    let v = 0; // velocidad suavizada del scroll (-1..1): inclina al bajar, inverso al subir
    const apply = () => {
      raf = 0;
      if (root.getAttribute("data-active") !== "true") return;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      const target = Math.max(-1, Math.min(1, dy / 30));
      v += (target - v) * 0.14;
      if (Math.abs(v) < 0.002 && target === 0) v = 0;
      const r = section.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      root.style.setProperty("--zx-orb-v", v.toFixed(3));
      root.style.setProperty("--zx-orb-p", p.toFixed(3));
      if (Math.abs(v) >= 0.002) raf = requestAnimationFrame(apply);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
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
