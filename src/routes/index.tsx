import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AgentWidget } from "@/components/experience/AgentWidget";
import { useReveal } from "@/hooks/use-reveal";
import { ZenoxHome } from "@/components/zenox/ZenoxHome";
import { ZenoxHeader } from "@/components/zenox/ZenoxHeader";
import { ZenoxFooter } from "@/components/zenox/ZenoxFooter";
import { ZX_FAQ, ZX_META } from "@/components/zenox/zenox-copy";
import { useLanguage } from "@/lib/i18n";

// Home oficial: diseño Zenox. La versión anterior vive en /legacy-home (reversión segura).
// El contenido Zenox está redactado en español; otros idiomas se redirigen a la home anterior.
const title = ZX_META.title;
const description = ZX_META.description;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ZX_FAQ.map((item) => ({
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
    links: [{ rel: "canonical", href: "https://www.logixtic.co/" }],
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
  const { content, locale } = useLanguage();

  if (locale !== "es") {
    return <Navigate to="/legacy-home" replace />;
  }

  return (
    <div className="min-h-screen bg-night">
      <a
        href="#contenido"
        className="focus-ring sr-only font-ui text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-amber focus:px-4 focus:py-2 focus:text-night"
      >
        {content.ui.skipContent}
      </a>
      <ZenoxHeader />
      <main id="contenido">
        <ZenoxHome />
      </main>
      <ZenoxFooter />
      <AgentWidget />
    </div>
  );
}
