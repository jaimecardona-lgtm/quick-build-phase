import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useLanguage, type Locale } from "@/lib/i18n";

const options: Array<{ locale: Locale; code: string; label: string }> = [
  { locale: "es", code: "ES", label: "Español" },
  { locale: "en", code: "EN", label: "English" },
  { locale: "pt-BR", code: "PT", label: "Português" },
];

export function LanguageSelector() {
  const { locale, setLocale, content } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeCode = options.find((option) => option.locale === locale)?.code ?? "ES";

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="language-selector">
      <button
        type="button"
        className="focus-ring language-trigger"
        aria-label={content.ui.language}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe2 aria-hidden="true" />
        <span>{activeCode}</span>
        <ChevronDown aria-hidden="true" className={open ? "rotate-180" : ""} />
      </button>
      {open ? (
        <div className="language-menu" role="menu" aria-label={content.ui.language}>
          {options.map((option) => (
            <button
              key={option.locale}
              type="button"
              role="menuitemradio"
              aria-checked={locale === option.locale}
              className="focus-ring language-option"
              data-active={locale === option.locale}
              onClick={() => {
                setLocale(option.locale);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {locale === option.locale ? <Check aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}