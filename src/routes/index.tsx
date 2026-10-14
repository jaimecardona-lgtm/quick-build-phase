import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { SuccessStories } from "@/components/site/SuccessStories";
import { Flow } from "@/components/site/Flow";
import { LogixAI } from "@/components/site/LogixAI";
import { ClientsReel } from "@/components/site/ClientsReel";
import { OperationalChallenges } from "@/components/site/OperationalChallenges";
import { Evidence } from "@/components/site/Evidence";
import { Implementation } from "@/components/site/Implementation";
import { Plans } from "@/components/site/Plans";
import { Faq } from "@/components/site/Faq";
import { ResourcesBand } from "@/components/site/ResourcesBand";
import { Closing } from "@/components/site/Closing";
import { Footer } from "@/components/site/Footer";
import { useReveal } from "@/hooks/use-reveal";
import { faqs } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";

const title = "Logixtic® | Software para Agentes de Carga Internacional";
const description =
  "Logixtic® conecta la gestión comercial, operativa, documental y de clientes de los agentes de carga internacional en una sola plataforma, con automatización e inteligencia artificial aplicada a la operación.";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Logixtic",
  url: "https://www.logixtic.co/",
  email: "info@logixtic.co",
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Logixtic",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://www.logixtic.co/" },
      { rel: "preload", as: "image", href: "/assets/01-plataforma-servicios-menu.webp" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(orgSchema) },
      { type: "application/ld+json", children: JSON.stringify(appSchema) },
      { type: "application/ld+json", children: JSON.stringify(faqSchema) },
    ],
  }),
  component: Index,
});

function Index() {
  useReveal();
  const { content } = useLanguage();

  return (
    <div className="min-h-screen bg-night">
      <a
        href="#contenido"
        className="focus-ring sr-only font-ui text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-amber focus:px-4 focus:py-2 focus:text-night"
      >
        {content.ui.skipContent}
      </a>
      <Header />
      <main id="contenido">
        <Hero />
        <ClientsReel />
        <OperationalChallenges />
        <Problem />
        <SuccessStories />
        <Flow />
        <LogixAI />
        <Evidence />
        <Implementation />
        <Plans />
        <Faq />
        <ResourcesBand />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
