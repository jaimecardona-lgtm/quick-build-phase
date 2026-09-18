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

        <div data-reveal className="reveal-item converge mt-16 md:mt-20">
          <ul className="converge-sources">
            {problem.sources.map((source, index) => {
              const Icon = icons[source.icon];
              return (
                <li key={source.label} className="converge-node" style={{ transitionDelay: `${index * 90}ms` }}>
                  <Icon className="h-4 w-4 text-skybrand" aria-hidden="true" />
                  {source.label}
                </li>
              );
            })}
          </ul>
          <div className="converge-lines" aria-hidden="true">
            <svg viewBox="0 0 220 300" preserveAspectRatio="none">
              {[30, 90, 150, 210, 270].map((y) => (
                <path key={y} className="converge-line" d={`M0 ${y} C130 ${y} 110 150 220 150`} />
              ))}
            </svg>
          </div>
          <div className="converge-core">
            <img
              src="/assets/logixtic-logo-negativo-transparente.png"
              alt="Logixtic"
              width={1520}
              height={465}
            />
            <p>{problem.outcome}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
