import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { ClientsReel } from "@/components/site/ClientsReel";
import { OperationalChallenges } from "@/components/site/OperationalChallenges";
import { Problem } from "@/components/site/Problem";
import { ZenoxPreviewHero } from "@/components/zenox-preview/ZenoxPreviewHero";
import { ZenoxPreviewPlatform } from "@/components/zenox-preview/ZenoxPreviewPlatform";
import { ZenoxPreviewServices } from "@/components/zenox-preview/ZenoxPreviewServices";
import { Flow } from "@/components/site/Flow";
import "@/components/zenox-preview/zenox-preview.css";
import { LogixAI } from "@/components/site/LogixAI";
import { SuccessStories } from "@/components/site/SuccessStories";
import { Evidence } from "@/components/site/Evidence";
import { Implementation } from "@/components/site/Implementation";
import { Plans } from "@/components/site/Plans";
import { Faq } from "@/components/site/Faq";
import { Closing } from "@/components/site/Closing";
import { Footer } from "@/components/site/Footer";
import { AgentWidget } from "@/components/experience/AgentWidget";
import { useReveal } from "@/hooks/use-reveal";
import { useLanguage } from "@/lib/i18n";
import { PREVIEW_COPY, previewLang } from "@/components/zenox-preview/zenox-preview-copy";

// Vista previa local de la nueva secuencia narrativa. No sustituye la Home "/".
// Contenido pendiente de aprobación comercial: casos, logos y video (ver docs del worktree).
const title = "Vista previa | Logixtic® (revisión interna)";
const description = "Vista previa interna de la nueva Home de Logixtic. No indexable.";

export const Route = createFileRoute("/zenox-preview")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ZenoxPreview,
});

function ZenoxPreview() {
  useReveal();
  const { content, locale } = useLanguage();
  const notice = PREVIEW_COPY[previewLang(locale)].notice;
  // Preview: «Plataforma» apunta a The Platform (#fragmentacion), no a Flow (#plataforma, Digitalización).
  const navLinks = content.nav.map((link) =>
    link.href === "#plataforma" ? { ...link, href: "#fragmentacion" } : link,
  );

  return (
    <div className="zxp-page min-h-screen bg-night">
      <Header navLinks={navLinks} />
      <main id="contenido" className="bg-night">
        {/* Espaciador de la cabecera fija (altura fija, sin margen para no colapsar y dejar ver el body). */}
        <div aria-hidden="true" className="h-16 bg-night md:h-[76px]" />
        {/* Aviso en el flujo del documento (no fijo): no tapa CTA, Logix ni WhatsApp. */}
        <div
          role="status"
          className="border-b border-amber/30 bg-night px-4 py-2 text-center font-ui text-xs leading-snug text-amber"
        >
          {notice}
        </div>
        {/* 01 Hero (composición Zenox-inspired) */}
        <ZenoxPreviewHero />
        {/* 03 Empresas (logos pendientes de permiso de uso: revisión interna) */}
        <ClientsReel />
        {/* 04 Problemas del Freight Forwarder */}
        <OperationalChallenges />
        <Problem />
        {/* 05 Fragmentación → control (The Platform con capturas reales) */}
        <ZenoxPreviewPlatform />
        {/* 06 Ocho capacidades en tres grupos */}
        <ZenoxPreviewServices />
        {/* 07 Digitalización de procesos manuales (componente Flow existente, id propio para no duplicar #plataforma) */}
        {/* Cifras ocultas: el copy aprobado las marca [VALIDAR] hasta contar con su fuente y periodo. */}
        <Flow showResults={false} />
        {/* 08–09 Mapa internacional y globo de conectividad (métricas ocultas: pendientes de validación) */}
        <Evidence showMetrics={false} />
        {/* 11 Casos de éxito (pendientes de aval escrito: revisión interna) */}
        <SuccessStories />
        {/* 13 Logix, la IA aplicada a la operación */}
        <LogixAI />
        {/* 14 Implementación en seis etapas */}
        <Implementation />
        {/* 15 Planes y Setup Fee */}
        {/* reviewMode: sin "Ahorra hasta 15 %" ni "24/7" (marcados [VALIDAR] en el copy aprobado). */}
        <Plans reviewMode />
        {/* 16 Preguntas frecuentes */}
        <Faq />
        {/* 17 Cierre comercial */}
        <Closing />
      </main>
      <Footer />
      <AgentWidget />
    </div>
  );
}
