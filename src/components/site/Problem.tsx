import { FileSpreadsheet, FileText, Mail, MessageSquare, Phone } from "lucide-react";
import { problem } from "@/lib/content";

const icons = {
  sheet: FileSpreadsheet,
  mail: Mail,
  message: MessageSquare,
  phone: Phone,
  doc: FileText,
} as const;

export function Problem() {
  return (
    <section id="problema" aria-labelledby="problema-title" className="section-shell surface-deep">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">El costo de una operación fragmentada</p>
          <h2 id="problema-title" className="section-title-dark mt-4">
            {problem.title}
          </h2>
          <p className="section-lead-dark mt-5">{problem.body}</p>
        </div>

        <div data-reveal className="reveal-item converge mt-10 md:mt-12">
          <ul className="converge-sources">
            {problem.sources.map((source, index) => {
              const Icon = icons[source.icon];
              return (
                <li key={source.label} className={`converge-node converge-node-${index + 1}`} style={{ transitionDelay: `${index * 90}ms` }}>
                  <Icon className="h-4 w-4 text-skybrand" aria-hidden="true" />
                  {source.label}
                </li>
              );
            })}
          </ul>
          <div className="converge-core">
            <img
              src="/assets/logixtic-logo-negativo-transparente.png"
              alt="Logixtic"
              width={1520}
              height={465}
            />
            <p>{problem.outcome}</p>
            <figure className="converge-product" aria-hidden="true">
              <img src="/assets/01-plataforma-servicios-menu.webp" alt="" loading="lazy" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
