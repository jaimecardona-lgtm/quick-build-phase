import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { DataNetworkLayer } from "@/components/experience/DataNetworkLayer";
import { HeroWorldMap } from "@/components/zenox-preview/HeroWorldMap";
import {
  PREVIEW_COPY,
  PREVIEW_TRACK,
  previewLang,
} from "@/components/zenox-preview/zenox-preview-copy";

const HUB_URL = "https://meetings.hubspot.com/carlossalazar/diagnostico";
const ROI_URL = "https://diagnosticoroilogixtic.lovable.app/";

// Hero de la vista previa. H1 y textos aprobados (ES); EN/PT son borradores.
// Capas: rutas animadas (DataNetworkLayer, propia), cintas, luz de profundidad, capturas reales del producto
// y una tarjeta de trazabilidad multimodal demostrativa. Sin vídeo ni imágenes de procedencia no documentada.
export function ZenoxPreviewHero() {
  const { locale } = useLanguage();
  const lang = previewLang(locale);
  const t = PREVIEW_COPY[lang].hero;
  const tr = PREVIEW_TRACK[lang];
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
      <HeroWorldMap />
      <DataNetworkLayer variant="routes" />
      <div className="zxp-hero-light" aria-hidden="true" />

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
          <div className="zxp-laptop" aria-hidden="true">
            <div className="zxp-laptop-lid">
              <div className="zxp-laptop-screen">
                <img
                  src="/assets/01-plataforma-servicios-menu.webp"
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
            <div className="zxp-laptop-base" />
          </div>
          <div className="zxp-track" aria-hidden="true">
            <div className="zxp-track-head">
              <span className="zxp-track-kicker">{tr.kicker}</span>
              <span className="zxp-track-status">{tr.status}</span>
            </div>
            <p className="zxp-track-route">
              {tr.route.map((city, i) => (
                <span key={city}>
                  {i > 0 ? <span className="zxp-track-arrow"> → </span> : null}
                  {city}
                </span>
              ))}
            </p>
            <div className="zxp-track-bar">
              <span />
            </div>
            <p className="zxp-track-meta">
              {tr.mode} · {tr.eta}
            </p>
            <p className="zxp-track-note">{tr.note}</p>
          </div>
          <span className="zxp-node zxp-node-1">{t.nodeOne}</span>
          <span className="zxp-node zxp-node-2">{t.nodeTwo}</span>
        </div>
      </div>
    </section>
  );
}
