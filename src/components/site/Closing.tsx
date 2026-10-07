import { DemoButton } from "@/components/site/DemoButton";
import { useLanguage } from "@/lib/i18n";
import portAsset from "@/assets/logixtic-port-hero.webp.asset.json";

export function Closing() {
  const { content } = useLanguage();
  const { closing, ui } = content;
  return (
    <section id="demo" aria-labelledby="demo-title" className="closing-shell relative isolate overflow-hidden py-16 md:py-24">
      <img className="closing-port" src={portAsset.url} alt="" width={1672} height={941} loading="lazy" aria-hidden="true" />
      <div data-reveal className="reveal-item relative z-10 mx-auto max-w-3xl px-5 text-center md:px-8">
        <p className="section-kicker">{ui.closingKicker}</p>
        <h2 id="demo-title" className="closing-title mx-auto mt-5 max-w-[700px] font-display text-3xl leading-[1.12] font-semibold text-on-dark md:text-[2.75rem]">
          {closing.title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl font-ui text-base leading-relaxed text-on-dark/80">{closing.body}</p>
        <div className="mt-9 flex justify-center">
          <DemoButton sectionId="cierre" size="lg" />
        </div>
        <p className="mx-auto mt-6 max-w-xl font-ui text-xs leading-relaxed text-on-dark/65">{closing.note}</p>
      </div>
    </section>
  );
}
