import { ArrowRight, Building2, FileClock, FileText, Route, Users } from "lucide-react";
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
        </div>
        <div data-reveal className="reveal-item portal-proof">
          <ol className="portal-flow flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
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
          <div className="portal-client-orbit mt-8 grid gap-3 sm:grid-cols-2">
            {portal.benefits.map((benefit) => (
              <div key={benefit} className="portal-proof-item">
                {benefit.includes("operaciones") ? <Building2 aria-hidden="true" /> : benefit === "Trazabilidad" ? <Route aria-hidden="true" /> : benefit.includes("documentos") ? <FileText aria-hidden="true" /> : <FileClock aria-hidden="true" />}
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
