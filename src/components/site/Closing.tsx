import { DemoButton } from "@/components/site/DemoButton";
import { useLanguage } from "@/lib/i18n";
import portAsset from "@/assets/logixtic-port-hero.webp.asset.json";

export function Closing() {
  const { content } = useLanguage();
  const { closing, ui } = content;
  return (
    <section id="demo" aria-labelledby="demo-title" className="closing-shell relative isolate overflow-hidden py-14 md:py-20">
      <img className="closing-port" src={portAsset.url} alt="" width={1672} height={941} loading="lazy" aria-hidden="true" />
      <div data-reveal className="reveal-item relative z-10 mx-auto max-w-3xl px-5 text-center md:px-8">
        <p className="section-kicker">{ui.closingKicker}</p>
        <h2 id="demo-title" className="closing-title mx-auto mt-4 max-w-[760px] text-balance font-display text-[1.7rem] leading-[1.16] font-semibold text-on-dark md:text-[2.3rem]">
          {closing.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-ui text-base leading-relaxed font-medium text-on-dark/85 md:text-lg">{closing.body}</p>
        <div className="mt-7 flex justify-center">
          <DemoButton sectionId="cierre" size="lg" />
        </div>
        <p className="mx-auto mt-5 max-w-xl font-ui text-xs leading-relaxed text-on-dark/65">{closing.note}</p>
      </div>
    </section>
  );
}
