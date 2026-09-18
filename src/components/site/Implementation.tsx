import { implementation } from "@/lib/content";

export function Implementation() {
  return (
    <section id="implementacion" aria-labelledby="implementacion-title" className="section-shell surface-deep">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">Implementación y acompañamiento</p>
          <h2 id="implementacion-title" className="section-title-dark mt-4">
            {implementation.title}
          </h2>
          <p className="section-lead-dark mt-5">{implementation.body}</p>
        </div>

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {implementation.steps.map((step, index) => (
            <li
              key={step.label}
              data-reveal
              className="reveal-item panel-dark"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <span className="font-ui text-[11px] font-semibold tracking-[0.16em] text-skybrand">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-display text-base font-semibold text-on-dark">{step.label}</h3>
              <p className="mt-2 font-ui text-sm leading-relaxed text-on-dark/65">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
