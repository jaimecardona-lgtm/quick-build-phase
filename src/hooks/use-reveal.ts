import { useEffect } from "react";

/**
 * Revela una sola vez los elementos con [data-reveal] al entrar al viewport.
 * Solo altera opacity y transform mediante CSS.
 */
export function useReveal() {
  useEffect(() => {
    // Estado oculto solo con JavaScript activo: sin JS el contenido permanece visible.
    document.documentElement.classList.add("js-reveal");
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.setAttribute("data-visible", "true"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6%" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("js-reveal");
    };
  }, []);
}
