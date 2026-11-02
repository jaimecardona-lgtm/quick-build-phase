import { createFileRoute, lazyRouteComponent, notFound } from "@tanstack/react-router";

// Planeación estratégica de Integratech: herramienta INTERNA. No es una sección pública.
// Mientras no exista autenticación y autorización verificables en servidor, la ruta solo existe
// si el build se hace con VITE_PLANEACION_ENABLED=true (entorno interno). En el build público
// responde 404 y el módulo no se incluye en el bundle (importación dinámica tras la bandera).
// robots "noindex" no es seguridad: la compuerta de build sí impide servir el contenido.
// Constante definida en build (vite.config.ts). Sin bandera, Rollup elimina el módulo interno.
declare const __PLANEACION_ENABLED__: boolean;
const PLANEACION_ENABLED: boolean = __PLANEACION_ENABLED__;

export const Route = createFileRoute("/planeacion")({
  beforeLoad: () => {
    if (!PLANEACION_ENABLED) {
      throw notFound();
    }
  },
  head: () => ({
    meta: [
      { title: "Planeación Estratégica — Integratech" },
      {
        name: "description",
        content:
          "Planeación estratégica de Integratech y sus unidades: Logixtic, Orbitrack, Infraestructura e Integratech Corporativo.",
      },
      { property: "og:title", content: "Planeación Estratégica — Integratech" },
      {
        property: "og:description",
        content: "Planeación estratégica de Integratech y sus unidades de negocio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  // El import() queda dentro de la rama: con la bandera apagada no genera chunk público.
  component: PLANEACION_ENABLED
    ? lazyRouteComponent(() => import("@/components/planning/PlanningApp"), "PlanningApp")
    : PlaneacionDisabled,
});

// Nunca se renderiza: beforeLoad responde 404 cuando la bandera está apagada.
function PlaneacionDisabled() {
  return null;
}
