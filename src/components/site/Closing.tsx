import { DemoButton } from "@/components/site/DemoButton";
import { useLanguage } from "@/lib/i18n";
import logoAsset from "@/assets/logixtic-closing-official.png.asset.json";

export function Closing() {
  const { content } = useLanguage();
  const { closing } = content;
  return (
    <section id="demo" aria-labelledby="demo-title" className="closing-shell relative isolate overflow-hidden">
      <div data-reveal className="reveal-item closing-grid relative z-10 mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="closing-copy">
          <h2 id="demo-title" className="section-title-dark">
            {closing.title}
          </h2>
          <p className="closing-sub mt-3 font-ui text-base font-medium md:text-xl">{closing.body}</p>
          <div className="mt-6">
            <DemoButton sectionId="cierre" size="lg" />
          </div>
        </div>
        <img className="closing-logo" src={logoAsset.url} alt="Logixtic — Simplify Your Logistics" width={1920} height={610} loading="lazy" />
      </div>
    </section>
  );
}
