import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";

export function Faq() {
  const { content } = useLanguage();
  const { faqs, ui } = content;
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-shell surface-mid">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item max-w-3xl">
          <p className="section-kicker">{ui.faqKicker}</p>
          <h2 id="faq-title" className="section-title-dark mt-4">
            {ui.faqKicker}
          </h2>
        </div>
        <div className="mt-12 grid gap-3 lg:grid-cols-2">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="faq-item"
              onToggle={(event) => {
                if ((event.currentTarget as HTMLDetailsElement).open) {
                  track("faq_open", { question: item.q, section_id: "faq" });
                }
              }}
            >
              <summary className="focus-ring">
                <span className="font-ui text-sm font-medium text-on-dark">{item.q}</span>
                <Plus className="h-4 w-4 shrink-0 text-skybrand" aria-hidden="true" />
              </summary>
              <p className="mt-3 font-ui text-sm leading-relaxed text-on-dark/68">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
