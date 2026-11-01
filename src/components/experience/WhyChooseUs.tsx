import { BarChart3, Calculator, FolderOpen, LayoutGrid, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";
import { CinematicBackgroundSequence } from "@/components/experience/CinematicBackgroundSequence";
import { SCENE_SECTIONS, videoClipsFor } from "@/lib/visual-scenes";
import { whyChooseCopy } from "@/components/experience/why-choose-labels";
import "@/components/experience/why-choose.css";

/*
 * "Por qué elegirnos" (variante V2): tarjetas de capacidades de software con conectores y profundidad.
 * Referencia visual: public/imagenes feedback/Por que elegirnos - Logixtic.jfif.jpeg (no se incrusta).
 * Sin cifras ni promesas nuevas: solo los títulos candidatos de why-choose-labels.ts.
 */

const ICONS = [LayoutGrid, Calculator, FolderOpen, TrendingUp, BarChart3] as const;

export function WhyChooseUs() {
  const { locale } = useLanguage();
  const copy = whyChooseCopy(locale);

  return (
    <section className="wcu bgseq-host" aria-labelledby="wcu-title">
      <CinematicBackgroundSequence clips={videoClipsFor(SCENE_SECTIONS.whyChoose)} className="bgseq-veil-strong" />
      <DataNetworkLayer variant="network" />
      <div className="mx-auto max-w-[1320px] px-5 md:px-8">
        <div data-reveal className="reveal-item wcu-head">
          <p className="section-kicker">{copy.kicker}</p>
        </div>
        <ol className="wcu-grid" aria-label={copy.kicker}>
          {copy.items.map((item, i) => {
            const Icon = ICONS[i] ?? LayoutGrid;
            return (
              <li key={item} data-reveal className="reveal-item wcu-card" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="wcu-icon" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="title-h3 text-on-dark">{item}</h3>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
