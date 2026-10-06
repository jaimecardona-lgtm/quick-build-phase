import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { successCopy } from "@/lib/whatsapp";

const VIDEO_ID = "V39UQwu2THo";

export function SuccessStories() {
  const { locale } = useLanguage();
  const t = successCopy[locale];
  const [open, setOpen] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <section id="transformacion" aria-labelledby="casos-title" className="success-shell">
      <div className="mx-auto max-w-[1150px] px-5 text-center md:px-8">
        <div data-reveal className="reveal-item">
          <p className="success-kicker">{t.kicker}</p>
          <h2 id="casos-title" className="success-title">
            {t.titleStart} <span className="success-brand">Logi<span>x</span>tic</span>
          </h2>
          <p className="success-body">{t.body}</p>
        </div>
        <div data-reveal className="reveal-item success-video-wrap">
          <button
            ref={triggerRef}
            type="button"
            className="success-video focus-ring"
            aria-label="Ver historia de cliente"
            onClick={() => setOpen(true)}
          >
            <img
              src={thumb}
              alt={t.coverAlt}
              loading="lazy"
              onError={() => setThumb(`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`)}
            />
            <span className="success-play" aria-hidden="true"><Play className="h-7 w-7" fill="currentColor" /></span>
          </button>
        </div>
      </div>

      {open && (
        <div className="success-modal" role="dialog" aria-modal="true" aria-label={t.play} onClick={() => setOpen(false)}>
          <div className="success-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="success-close focus-ring" aria-label={t.close} onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
              title={t.play}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
