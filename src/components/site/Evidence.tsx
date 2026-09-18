import { useState } from "react";
import { evidence } from "@/lib/content";
import { track } from "@/lib/analytics";

export function Evidence() {
  const [active, setActive] = useState(0);
  const current = evidence.cases[active]!;

  return (
    <section id="clientes" aria-labelledby="clientes-title" className="section-shell surface-mid">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">Evidencia</p>
          <h2 id="clientes-title" className="section-title-dark mt-4">
            {evidence.title}
          </h2>
          <p className="section-lead-dark mt-5">{evidence.body}</p>
        </div>

        <ul data-reveal className="reveal-item mt-12 flex flex-wrap gap-x-10 gap-y-4 border-y border-on-dark/10 py-6">
          {evidence.companies.map((company) => (
            <li key={company} className="font-display text-base font-semibold text-on-dark/72">
              {company}
            </li>
          ))}
        </ul>

        <dl data-reveal className="reveal-item mt-12 grid gap-5 md:grid-cols-3">
          {evidence.metrics.map((metric) => (
            <div key={metric.label} className="panel-dark">
              <dt className="font-display text-2xl font-semibold text-on-dark md:text-3xl">{metric.value}</dt>
              <dd className="mt-2 font-ui text-sm text-on-dark/62">{metric.label}</dd>
            </div>
          ))}
        </dl>

        <div data-reveal className="reveal-item mt-12">
          <div role="tablist" aria-label="Casos de éxito" className="flex flex-wrap gap-2">
            {evidence.cases.map((item, index) => (
              <button
                key={item.company}
                type="button"
                role="tab"
                id={`caso-tab-${index}`}
                aria-selected={active === index}
                aria-controls={`caso-panel-${index}`}
                onClick={() => {
                  setActive(index);
                  track("case_select", { company: item.company, section_id: "clientes" });
                }}
                className="focus-ring tab-button"
                data-on={active === index}
              >
                {item.company}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`caso-panel-${active}`}
            aria-labelledby={`caso-tab-${active}`}
            className="panel-dark mt-5"
          >
            <h3 className="font-display text-lg font-semibold text-on-dark">{current.company}</h3>
            <p className="mt-3 max-w-2xl font-ui text-sm leading-relaxed text-on-dark/72">{current.result}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
