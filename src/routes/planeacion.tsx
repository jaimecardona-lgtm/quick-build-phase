import { createFileRoute } from "@tanstack/react-router";
import { PlanningApp } from "@/components/planning/PlanningApp";

export const Route = createFileRoute("/planeacion")({
  head: () => ({
    meta: [
      { title: "Planeación Estratégica — Integratech" },
      { name: "description", content: "Planeación estratégica de Integratech y sus unidades: Logixtic, Orbitrack, Infraestructura e Integratech Corporativo." },
      { property: "og:title", content: "Planeación Estratégica — Integratech" },
      { property: "og:description", content: "Planeación estratégica de Integratech y sus unidades de negocio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlaneacionPage,
});

function PlaneacionPage() {
  return <PlanningApp />;
}
