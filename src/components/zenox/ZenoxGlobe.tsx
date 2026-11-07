import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlobalCoverage } from "@/components/experience/GlobalCoverage";
import { useVisibility } from "./use-visibility";
import "./zenox-scenes.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * Cobertura global en la Home Zenox: envuelve el GlobalCoverage existente (no lo modifica).
 * - Entrada gradual al revelarse (reveal-item).
 * - Animaciones CSS y SMIL (órbitas) se pausan fuera de pantalla y se reanudan al volver.
 * - Inclinación leve siguiendo el cursor (solo puntero fino, sin reducir movimiento). Usa transform en un
 *   contenedor externo para no interferir con gc-float del propio globo.
 * Un único globo: GlobalCoverage se monta una sola vez.
 */
export function ZenoxGlobe() {
  const tiltRef = useRef<HTMLDivElement>(null);
  const rootRef = useVisibility<HTMLDivElement>((visible) => {
    const svgs = rootRef.current?.querySelectorAll<SVGSVGElement>("svg") ?? [];
    svgs.forEach((svg) => (visible ? svg.unpauseAnimations?.() : svg.pauseAnimations?.()));
  });

  // Entrada con profundidad ligada al scroll: el globo llega desde atrás y crece hasta su tamaño final.
  // Reversible al subir. Opacidad mínima 0.35 para que nunca quede invisible; con movimiento reducido no hay escena.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { opacity: 0.35, scale: 0.92, y: 80 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 92%", end: "center 45%", scrub: 0.5 },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [rootRef]);

  useEffect(() => {
    const root = rootRef.current;
    const tilt = tiltRef.current;
    if (!root || !tilt) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    const apply = () => {
      raf = 0;
      tilt.style.transform = `perspective(1100px) rotateX(${(-ty * 4).toFixed(2)}deg) rotateY(${(tx * 5).toFixed(2)}deg)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      schedule();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      schedule();
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      tilt.style.transform = "";
    };
  }, [rootRef]);

  return (
    <div ref={rootRef} className="zx-globe" data-active="false">
      <div ref={tiltRef} className="zx-globe-tilt">
        <GlobalCoverage variant="zenox" />
      </div>
    </div>
  );
}
