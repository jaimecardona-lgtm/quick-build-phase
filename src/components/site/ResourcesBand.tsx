import { ArrowUpRight } from "lucide-react";
import { resourceLinks } from "@/lib/content";
import { track } from "@/lib/analytics";

export function ResourcesBand() {
  return (
    <section id="recursos" aria-labelledby="recursos-title" className="surface-deep border-y border-on-dark/10 py-14 md:py-16">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 id="recursos-title" className="font-display text-xl font-semibold text-on-dark md:text-2xl">
            Recursos para seguir avanzando
          </h2>
          <ul className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-4">
            {resourceLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => track("resource_link_click", { resource: item.label, section_id: "recursos" })}
                  className="focus-ring group flex min-h-[44px] items-start justify-between gap-3 rounded-md border border-on-dark/12 bg-on-dark/5 px-4 py-3 transition-colors hover:border-skybrand/40 hover:bg-on-dark/8"
                >
                  <span>
                    <span className="block font-ui text-sm font-medium text-on-dark">{item.label}</span>
                    <span className="mt-0.5 block font-ui text-xs text-on-dark/55">{item.description}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-skybrand transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
