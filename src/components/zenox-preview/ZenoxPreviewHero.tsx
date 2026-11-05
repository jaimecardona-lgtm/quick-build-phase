import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { PREVIEW_COPY, previewLang } from "@/components/zenox-preview/zenox-preview-copy";

const HUB_URL = "https://meetings.hubspot.com/carlossalazar/diagnostico";
const ROI_URL = "https://diagnosticoroilogixtic.lovable.app/";

// Hero de la vista previa Zenox. Textos del documento oficial (copy v1); EN/PT son borradores.
export function ZenoxPreviewHero() {
  const { locale } = useLanguage();
  const t = PREVIEW_COPY[previewLang(locale)].hero;
  return (
    <section id="inicio" className="zxp-hero" aria-labelledby="zxp-hero-title">
      <div className="zxp-hero-ribbons" aria-hidden="true">
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <path
            className="zxp-ribbon zxp-ribbon-a"
            d="M-80 560 C 260 300, 520 720, 860 420 S 1380 180, 1700 360"
          />
          <path
            className="zxp-ribbon zxp-ribbon-b"
            d="M-80 640 C 300 430, 600 820, 940 520 S 1420 300, 1700 470"
          />
          <path
            className="zxp-ribbon zxp-ribbon-c"
            d="M-80 300 C 340 520, 640 120, 980 330 S 1400 560, 1700 220"
          />
        </svg>
      </div>

      <div className="zxp-hero-grid">
        <div className="zxp-hero-copy">
          <p className="zxp-kicker">{t.eyebrow}</p>
          <h1 id="zxp-hero-title" className="zxp-title">
            {t.h1Start} <span>{t.h1End}</span>
          </h1>
          <p className="zxp-support">{t.support}</p>
          <p className="zxp-body">{t.body}</p>
          <div className="zxp-ctas">
            <a
              className="zxp-btn zxp-btn-primary"
              href={HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.ctaPrimary} <ArrowRight aria-hidden="true" size={16} />
            </a>
            <a
              className="zxp-btn zxp-btn-ghost"
              href={ROI_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.ctaSecondary} <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
          <p className="zxp-micro">{t.micro}</p>
        </div>

        <div className="zxp-hero-stack" role="img" aria-label={t.ariaCaption}>
          <figure className="zxp-glass zxp-glass-back">
            <img src="/assets/06-costos-operacion.webp" alt="" loading="eager" decoding="async" />
          </figure>
          <figure className="zxp-glass zxp-glass-front">
            <img
              src="/assets/02-gestion-comercial-resumen.webp"
              alt=""
              loading="eager"
              decoding="async"
            />
          </figure>
          <span className="zxp-node zxp-node-1">{t.nodeOne}</span>
          <span className="zxp-node zxp-node-2">{t.nodeTwo}</span>
        </div>
      </div>
    </section>
  );
}
