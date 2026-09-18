import { ArrowUpRight, BookOpen, FileText, Library, Video } from "lucide-react";
import { resourceLinks } from "@/lib/content";
import { track } from "@/lib/analytics";

export function ResourcesBand() {
  const icons = [FileText, BookOpen, Video, Library];
  return (
    <section id="recursos" aria-labelledby="recursos-title" className="surface-deep border-y border-on-dark/10 py-14 md:py-16">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 id="recursos-title" className="font-display text-xl font-semibold text-on-dark md:text-2xl">
            Recursos para seguir avanzando
          </h2>
          <ul className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-4">
            {resourceLinks.map((item, index) => {
              const Icon = icons[index] ?? FileText;
              return (
              <li key={item.label}>
                {item.available ? (
                  <a
                    href={item.href}
                    onClick={() => track("resource_link_click", { resource: item.label, section_id: "recursos" })}
                    className="focus-ring resource-cover group"
                  >
                    <Icon className="resource-icon" aria-hidden="true" />
                    <span>
                      <span className="block font-ui text-sm font-medium text-on-dark">{item.label}</span>
                      <span className="mt-0.5 block font-ui text-xs text-on-dark/55">{item.description}</span>
                    </span>
                    <ArrowUpRight className="resource-access" aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="resource-cover resource-disabled"
                  >
                    <Icon className="resource-icon" aria-hidden="true" />
                    <span>
                      <span className="block font-ui text-sm font-medium text-on-dark">{item.label}</span>
                      <span className="mt-0.5 block font-ui text-xs text-on-dark/55">{item.description}</span>
                    </span>
                  </span>
                )}
              </li>
            )})}
          </ul>
        </div>
      </div>
    </section>
  );
}
