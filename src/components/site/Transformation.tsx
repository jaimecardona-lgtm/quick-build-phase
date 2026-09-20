import { Check, Minus } from "lucide-react";
import { transformation } from "@/lib/content";

export function Transformation() {
  return (
    <section id="transformacion" aria-labelledby="transformacion-title" className="section-shell surface-mid">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">La transformación Logixtic®</p>
          <h2 id="transformacion-title" className="section-title-dark mt-4">
            {transformation.title}
          </h2>
          <p className="section-lead-dark mt-5">{transformation.body}</p>
        </div>

        <div data-reveal className="reveal-item transformation-rail mt-10 md:mt-12">
          <article className="transformation-before">
            <h3 className="font-display text-lg font-semibold text-on-dark/80">Antes</h3>
            <ul className="mt-5 space-y-3">
              {transformation.before.map((item) => (
                <li key={item} className="flex items-center gap-3 font-ui text-sm text-on-dark/62">
                  <Minus className="h-4 w-4 shrink-0 text-on-dark/40" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <div className="transformation-transfer" aria-hidden="true">
            <span />
          </div>
          <article className="transformation-after">
            <h3 className="font-display text-lg font-semibold text-on-dark">Con Logixtic®</h3>
            <ul className="mt-5 space-y-3">
              {transformation.after.map((item) => (
                <li key={item} className="flex items-center gap-3 font-ui text-sm text-on-dark/82">
                  <Check className="h-4 w-4 shrink-0 text-skybrand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <figure className="product-frame transformation-product mt-6">
              <div className="product-toolbar" aria-hidden="true"><span /><span /><span /></div>
              <img
                src={transformation.image}
                alt={transformation.imageAlt}
                loading="lazy"
                className="block w-full"
              />
            </figure>
          </article>
        </div>

        <ol data-reveal className="reveal-item moments mt-10">
          {transformation.moments.map((moment, index) => (
            <li key={moment}>
              <span className="moment-dot" aria-hidden="true" />
              <span className="font-display text-base font-semibold text-on-dark md:text-lg">{moment}</span>
              <span className="font-ui text-xs text-on-dark/50">0{index + 1}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
