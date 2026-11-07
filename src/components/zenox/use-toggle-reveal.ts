import { useEffect, useRef, type RefObject } from "react";

/*
 * Revelado reversible: data-visible="true" mientras el elemento está en pantalla y "false" al salir.
 * Así el movimiento se repite al bajar y al subir. El servidor escribe "true": sin JavaScript todo queda visible.
 * Con movimiento reducido no se observa nada y el CSS no aplica desplazamientos.
 */
export function useToggleReveal<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.setAttribute("data-visible", String(!!entry?.isIntersecting));
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
