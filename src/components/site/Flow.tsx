import { useState } from "react";
import { Layers } from "lucide-react";
import { flow } from "@/lib/content";
import { track } from "@/lib/analytics";

export function Flow() {
  const [active, setActive] = useState(0);
  const stage = flow.stages[active] ?? flow.stages[0];
  const previousStage = flow.stages[(active - 1 + flow.stages.length) % flow.stages.length];
  const nextStage = flow.stages[(active + 1) % flow.stages.length];

  if (!stage) return null;

  const select = (index: number) => {
    const selected = flow.stages[index];
    if (!selected) return;
    setActive(index);
    track("flow_stage_select", { stage: selected.label, section_id: "plataforma" });
  };

  return (
    <section id="plataforma" aria-labelledby="plataforma-title" className="section-shell surface-deep">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">Así fluye una operación</p>
          <h2 id="plataforma-title" className="section-title-dark mt-4">
            {flow.title}
          </h2>
          <p className="section-lead-dark mt-5">{flow.body}</p>
        </div>

        <div className="flow-layout mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,38%)] lg:gap-12">
          <div className="flow-visual lg:sticky lg:top-28 lg:h-fit">
            {previousStage?.image ? <img className="flow-layer flow-layer-back" src={previousStage.image} alt="" loading="lazy" aria-hidden="true" /> : null}
            {nextStage?.image ? <img className="flow-layer flow-layer-mid" src={nextStage.image} alt="" loading="lazy" aria-hidden="true" /> : null}
            <figure className="product-frame flow-product-frame">
              <div className="flex h-10 items-center justify-between border-b border-on-dark/10 px-4">
                <span className="font-ui text-[10px] tracking-[0.16em] text-on-dark/55 uppercase">
                  Logixtic® · {stage.label}
                </span>
                <span className="font-ui text-[10px] text-on-dark/45">
                  {active + 1} / {flow.stages.length}
                </span>
              </div>
              <div className="relative aspect-[2/1] bg-night">
                {stage.image ? <img key={stage.image} src={stage.image} alt={stage.alt ?? ""} loading="lazy" className="flow-active-image absolute inset-0 h-full w-full object-contain" /> : null}
                {stage.image ? null : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-on-dark/60">
                    <Layers className="h-7 w-7 text-skybrand" aria-hidden="true" />
                    <p className="max-w-xs px-6 text-center font-ui text-sm">{stage.body}</p>
                  </div>
                )}
              </div>
            </figure>
            <div
              className="mt-4 h-px bg-on-dark/12"
              role="progressbar"
              aria-label="Progreso del recorrido operativo"
              aria-valuemin={1}
              aria-valuemax={flow.stages.length}
              aria-valuenow={active + 1}
            >
              <div
                className="h-px bg-skybrand transition-[width] duration-300"
                style={{ width: `${((active + 1) / flow.stages.length) * 100}%` }}
              />
            </div>
          </div>

          <ol className="flow-stages">
            {flow.stages.map((item, index) => (
              <li key={item.label}>
                <button
                  type="button"
                  aria-current={active === index}
                  onClick={() => select(index)}
                  onFocus={() => setActive(index)}
                  className="focus-ring stage-button"
                  data-on={active === index}
                >
                  <span className="stage-signal" aria-hidden="true" />
                  <span className="font-ui text-[11px] font-semibold tracking-[0.16em] text-skybrand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block font-display text-base font-semibold text-on-dark">
                    {item.label}
                  </span>
                  <span className="mt-1 block font-ui text-sm leading-relaxed text-on-dark/60">
                    {item.body}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
