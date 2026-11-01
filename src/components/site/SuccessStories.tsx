import { useLanguage } from "@/lib/i18n";
import { successCopy } from "@/lib/whatsapp";
import { TestimonialStage } from "@/components/experience/TestimonialStage";
import { CinematicBackgroundSequence } from "@/components/experience/CinematicBackgroundSequence";
import { CINEMATIC_CLIPS } from "@/lib/cinematic-media";

// Tren en tránsito de fondo: continuidad de la operación detrás del reproductor.
const SUCCESS_CLIPS = [CINEMATIC_CLIPS.rail];

// Video autorizado existente (no se re-aloja ni se descarga).
const VIDEO_ID = "V39UQwu2THo";

export function SuccessStories() {
  const { locale } = useLanguage();
  const t = successCopy[locale];

  return (
    <section id="transformacion" aria-labelledby="casos-title" className="success-shell amb bgseq-host">
      <CinematicBackgroundSequence clips={SUCCESS_CLIPS} className="bgseq-veil-strong" />
      <div className="mx-auto max-w-[1150px] px-5 text-center md:px-8">
        <div data-reveal className="reveal-item">
          <p className="section-kicker">{t.kicker}</p>
          <h2 id="casos-title" className="section-title-dark mx-auto mt-4 text-balance">
            {t.titleStart}{" "}
            <span className="success-brand">
              Logi<span>x</span>tic
            </span>
          </h2>
          <p className="success-body">{t.body}</p>
        </div>
        <div data-reveal className="reveal-item success-video-wrap">
          <TestimonialStage
            videoId={VIDEO_ID}
            poster={`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`}
            posterAlt={t.coverAlt}
            title={t.play}
            aria-label="Ver historia de cliente"
          />
        </div>
      </div>
    </section>
  );
}
