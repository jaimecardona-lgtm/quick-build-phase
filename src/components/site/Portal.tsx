import { ArrowRight, Building2, Check, Users } from "lucide-react";
import { portal } from "@/lib/content";

export function Portal() {
  return (
    <section id="portal-clientes" aria-labelledby="portal-title" className="section-shell-compact surface-deep">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 md:px-8 lg:grid-cols-2">
        <div data-reveal className="reveal-item">
          <p className="section-kicker">Portal de Clientes</p>
          <h2 id="portal-title" className="section-title-dark mt-4">
            {portal.title}
          </h2>
          <p className="section-lead-dark mt-5">{portal.body}</p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {portal.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2.5 font-ui text-sm text-on-dark/78">
                <Check className="h-4 w-4 shrink-0 text-skybrand" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="reveal-item panel-dark">
          <ol className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            {portal.diagram.map((node, index) => (
              <li key={node} className="flex flex-1 items-center gap-3">
                <span className="diagram-node">
                  {index === 0 ? (
                    <Users className="h-4 w-4 text-skybrand" aria-hidden="true" />
                  ) : index === 1 ? (
                    <Building2 className="h-4 w-4 text-amber" aria-hidden="true" />
                  ) : (
                    <Users className="h-4 w-4 text-skybrand" aria-hidden="true" />
                  )}
                  {node}
                </span>
                {index < portal.diagram.length - 1 ? (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-on-dark/35 sm:block" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
