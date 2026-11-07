import { useToggleReveal } from "./use-toggle-reveal";
import "./zenox-tablet.css";

/*
 * Tablet sostenida por manos (mockup base: public/zenox-kit/tablet.png, lienzo 1122×1402).
 * Estructura:
 *   contenedor .zx-tab (proporción del lienzo, centrado, escalable)
 *     → brillo .zx-tab-glow (detrás)
 *     → mockup base .zx-tab-device (la imagen completa, con el vidrio en blanco)
 *     → viewport .zx-tab-screen (overflow hidden, posicionado en % con las medidas del vidrio)
 *         → capturas .zx-tab-layer (object-fit: cover, centradas, sin deformar)
 * Las capturas solo se ven dentro del vidrio: el marco y las manos quedan por encima del viewport.
 */

export type TabletState = { src: string; alt: string };

const DEVICE_SRC = "/zenox-kit/tablet.png";

export function ZenoxTablet({ states, active }: { states: readonly TabletState[]; active: number }) {
  const ref = useToggleReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="zx-tab zx-tr" data-visible="true" data-active-state={active} aria-hidden="true">
      <div className="zx-tab-glow" />
      <img className="zx-tab-device" src={DEVICE_SRC} alt="" width={1122} height={1402} decoding="async" />
      <div className="zx-tab-screen">
        {states.map((s, i) => (
          <img
            key={s.src}
            className="zx-tab-layer"
            data-layer={i}
            src={s.src}
            alt=""
            width={1000}
            height={848}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}
