import { DemoButton } from "@/components/site/DemoButton";
import { closing } from "@/lib/content";
import portAsset from "@/assets/logixtic-port-hero.webp.asset.json";

export function Closing() {
  return (
    <section id="demo" aria-labelledby="demo-title" className="closing-shell relative isolate overflow-hidden py-24 md:py-32">
      <img className="closing-port" src={portAsset.url} alt="" width={1672} height={941} loading="lazy" aria-hidden="true" />
      <div className="closing-pattern" aria-hidden="true" />
      <svg className="closing-route" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 208 C280 210 382 150 590 164 S888 92 1200 112" />
      </svg>
      <div data-reveal className="reveal-item relative z-10 mx-auto max-w-3xl px-5 text-center md:px-8">
        <p className="section-kicker">Cierre y conversión</p>
        <h2 id="demo-title" className="mt-5 font-display text-3xl leading-[1.1] font-semibold text-on-dark md:text-5xl">
          {closing.title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl font-ui text-base leading-relaxed text-on-dark/70">{closing.body}</p>
        <div className="mt-9 flex justify-center">
          <DemoButton sectionId="cierre" size="lg" />
        </div>
        <p className="mx-auto mt-6 max-w-xl font-ui text-xs leading-relaxed text-on-dark/50">{closing.note}</p>
      </div>
    </section>
  );
}
