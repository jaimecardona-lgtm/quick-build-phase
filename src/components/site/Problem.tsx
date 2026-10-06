import { useState } from "react";
import { Check, FileSpreadsheet, FileText, Users, ClipboardList, FileBadge, FolderOpen, Route, Receipt } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { fragmentation } from "@/lib/fragmentation";

const icons = [FileSpreadsheet, FileText, Users, ClipboardList, FileBadge, FolderOpen, Route, Receipt];
// Card i sits in row floor(i/2); left column cards are a half-row higher than right ones.
const startY = [32, 62, 110, 140, 188, 218, 266, 296];
const paths = startY.map((y) => `M0 ${y} C 90 ${y}, 120 205, 200 164`);

export function Problem() {
  const { locale } = useLanguage();
  const t = fragmentation[locale];
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="problema" aria-labelledby="problema-title" className="section-shell surface-deep frag">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-4xl">
          <p className="section-kicker">{t.kicker}</p>
          <h2 id="problema-title" className="section-title-dark mt-4">{t.title}</h2>
          <p className="section-lead-dark mt-5">{t.body}</p>
        </div>

        <div data-reveal className="frag-stage mt-10 md:mt-14">
          <div className="frag-zone frag-sources">
            <p className="frag-step"><span>01</span>{t.steps[0]}</p>
            <ul className="frag-cards">
              {t.cards.map((label, i) => {
                const Icon = icons[i] ?? FileText;
                return (
                  <li
                    key={i}
                    className={`frag-card ${i % 2 ? "frag-card-r" : ""} ${active === i ? "is-active" : ""}`}
                    style={{ ["--d" as string]: `${300 + i * 70}ms` }}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="frag-zone frag-link" aria-hidden="true">
            <p className="frag-step"><span>02</span>{t.steps[1]}</p>
            <svg className="frag-svg" viewBox="0 0 260 328" preserveAspectRatio="none">
              {paths.map((d, i) => (
                <path key={i} id={`frag-p${i}`} d={d} className={`frag-line ${active === i ? "is-active" : ""}`} pathLength={1} style={{ ["--d" as string]: `${900 + i * 60}ms` }} vectorEffect="non-scaling-stroke" />
              ))}
              <path d="M200 164 L258 164" className="frag-arrow" pathLength={1} vectorEffect="non-scaling-stroke" />
              {paths.map((_, i) => (
                <circle key={i} r="2.4" className="frag-dot">
                  <animateMotion dur={`${3.2 + (i % 4) * 0.5}s`} begin={`${1.6 + i * 0.25}s`} repeatCount="indefinite">
                    <mpath href={`#frag-p${i}`} />
                  </animateMotion>
                </circle>
              ))}
            </svg>
            <span className="frag-hub" />
            <span className="frag-vline" />
          </div>

          <div className="frag-zone frag-control">
            <p className="frag-step"><span>03</span>{t.steps[2]}</p>
            <div className="frag-panel">
              <img src="/assets/logixtic-logo-negativo-transparente.png" alt="Logixtic" width={1520} height={465} className="frag-logo" />
              <p className="frag-claim">{t.control}</p>
              <figure className="frag-shot">
                <div className="frag-shot-bar" aria-hidden="true"><i /><i /><i /></div>
                <img src="/assets/07-rentabilidad-margen.webp" alt={t.shotAlt} loading="lazy" />
              </figure>
              <ul className="frag-benefits">
                {t.benefits.map((b, i) => (
                  <li key={i} style={{ ["--d" as string]: `${2500 + i * 120}ms` }}>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
