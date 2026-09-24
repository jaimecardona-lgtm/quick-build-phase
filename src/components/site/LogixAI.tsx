import { ClipboardCheck, FileText, Search, Settings2, ShoppingCart, UserRoundSearch, UsersRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import logixAsset from "@/assets/logix-transparent.png.asset.json";

const sourceIcons = [UsersRound, UserRoundSearch, ClipboardCheck, ShoppingCart, Settings2, FileText];

export function LogixAI() {
  const { content } = useLanguage();
  const { logix, ui } = content;
  const sources = content.ui.logixModules.map((label, index) => ({
    label,
    icon: sourceIcons[index] ?? FileText,
  }));
  return (
    <section id="logix-ai" aria-labelledby="logix-title" className="section-shell surface-mid">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 md:px-8 lg:grid-cols-[minmax(0,30%)_minmax(0,1fr)]">
        <div data-reveal className="reveal-item logix-orbit">
          <div className="logix-portrait">
            <img src={logixAsset.url} alt="Logix" width={1254} height={1254} loading="lazy" />
          </div>
          <ul aria-label={ui.logixSources}>
            {sources.map((source, index) => {
              const Icon = source.icon;
              return (
                <li key={source.label} className={`logix-node logix-node-${index + 1}`} style={{ transitionDelay: `${index * 70}ms` }}>
                  <span className="logix-node-icon"><Icon aria-hidden="true" /></span>
                  <span>{source.label}</span>
                  <span className="logix-node-status" aria-hidden="true" />
                </li>
              );
            })}
          </ul>
        </div>

        <div data-reveal className="reveal-item">
          <p className="section-kicker">{ui.logixKicker}</p>
          <h2 id="logix-title" className="section-title-dark mt-4">
            {logix.title}
          </h2>
          <p className="section-lead-dark mt-5">{logix.body}</p>
          <p className="mt-8 font-ui text-[11px] font-semibold tracking-[0.16em] text-skybrand uppercase">
            {logix.exampleTitle}
          </p>
          <div className="logix-console mt-5">
            <p className="flex items-start gap-3 font-ui text-sm text-on-dark">
              <Search className="mt-0.5 h-4 w-4 shrink-0 text-skybrand" aria-hidden="true" />
              <span>
                <span className="font-semibold">{ui.query}</span> {logix.query}
              </span>
            </p>
            <p className="mt-4 border-t border-on-dark/10 pt-4 font-ui text-sm leading-relaxed text-on-dark/70">
              {logix.answer}
            </p>
            <ul className="logix-answer-details mt-5">
              {logix.answerItems.map((item, index) => (
                <li key={item} className="logix-result-row" style={{ transitionDelay: `${index * 80}ms` }}>
                  <FileText className="h-4 w-4 text-skybrand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {logix.actions.map((chip) => (
              <li
                key={chip}
                className="rounded-md border border-on-dark/14 bg-on-dark/6 px-3.5 py-2 font-ui text-xs text-on-dark/75"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
