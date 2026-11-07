import { useEffect, useRef, type RefObject } from "react";

/*
 * Marca data-active="true|false" en el elemento según esté cerca del viewport.
 * Solo escribe atributos del DOM (sin re-render). Se desconecta al desmontar.
 * El valor inicial del servidor es "false" y el cliente lo corrige tras el montaje: sin desajustes de hidratación.
 */
export function useVisibility<T extends HTMLElement>(
  onChange?: (visible: boolean) => void,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const callback = useRef(onChange);
  callback.current = onChange;

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = !!entry?.isIntersecting;
        el.setAttribute("data-active", String(visible));
        callback.current?.(visible);
      },
      { rootMargin: "120px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
