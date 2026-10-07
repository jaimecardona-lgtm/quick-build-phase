import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { DemoButton } from "@/components/site/DemoButton";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import { useLanguage } from "@/lib/i18n";
import { track } from "@/lib/analytics";

export function Header() {
  const { content } = useLanguage();
  const { companyLink, diagnosticLink, nav, resourceLinks, ui } = content;
  const [scrolled, setScrolled] = useState(false);
  const [openResources, setOpenResources] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(false);
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("a, button");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [openMenu]);

  return (
    <header
      className={`fixed top-0 z-50 h-16 w-full transition-colors duration-300 md:h-[76px] ${
        scrolled ? "border-b border-on-dark/10 bg-night/94 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between gap-6 px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <a href="#inicio" className="focus-ring flex min-w-0 items-center rounded-md" aria-label={`Logixtic, ${ui.home}`}>
            <img src="/assets/logixtic-logo-negativo-transparente.png" alt="Logixtic" width={1520} height={465} className="h-6 w-auto md:h-7" />
          </a>
          <div className="hidden lg:block"><LanguageSelector /></div>
        </div>

        <nav aria-label={ui.mainNavigation} className="hidden items-center gap-7 lg:flex">
          {nav.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="focus-ring rounded-md py-2 font-ui text-sm text-on-dark/70 transition-colors hover:text-on-dark"
            >
              {link.label}
            </a>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setOpenResources(true)}
            onMouseLeave={() => setOpenResources(false)}
          >
            <button
              type="button"
              aria-expanded={openResources}
              onClick={() => setOpenResources((value) => !value)}
              className="focus-ring flex items-center gap-1 rounded-md py-2 font-ui text-sm text-on-dark/70 transition-colors hover:text-on-dark"
            >
              {ui.resources}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {openResources ? (
              <div className="absolute top-full left-0 w-52 rounded-md border border-on-dark/12 bg-night/97 p-2 shadow-product backdrop-blur-md">
                {resourceLinks.map((item) => (
                  item.available ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => track("resource_link_click", { resource: item.label, section_id: "header" })}
                      className="focus-ring block rounded-md px-3 py-2 font-ui text-sm text-on-dark/72 hover:bg-on-dark/8 hover:text-on-dark"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span
                      key={item.label}
                      aria-disabled="true"
                      className="block cursor-not-allowed rounded-md px-3 py-2 font-ui text-sm text-on-dark/34"
                    >
                      {item.label}
                    </span>
                  )
                ))}
              </div>
            ) : null}
          </div>
          <span
            aria-disabled="true"
            title={ui.pendingRoute}
            className="rounded-md py-2 font-ui text-sm text-on-dark/34"
          >
            {companyLink.label}
          </span>
          <a
            href={diagnosticLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-md py-2 font-ui text-sm text-on-dark/70 transition-colors hover:text-on-dark"
          >
            {diagnosticLink.label}
            <span className="sr-only">, {diagnosticLink.newTab}</span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <DemoButton sectionId="header" label={ui.headerCta} className="hidden sm:inline-flex" />
          <div className="lg:hidden"><LanguageSelector /></div>
          <button
            type="button"
            aria-expanded={openMenu}
            aria-label={openMenu ? ui.closeMenu : ui.openMenu}
            onClick={() => setOpenMenu((value) => !value)}
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-on-dark/15 text-on-dark lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {openMenu ? (
        <div className="fixed inset-0 top-0 z-50 bg-night/98 backdrop-blur-md lg:hidden" role="dialog" aria-modal="true" aria-label={ui.navigationMenu}>
          <div ref={panelRef} className="mx-auto flex h-full max-w-[640px] flex-col px-5 pt-5 pb-10">
            <div className="flex items-center justify-between">
              <img
                src="/assets/logixtic-logo-negativo-transparente.png"
                alt="Logixtic"
                width={1520}
                height={465}
                className="h-6 w-auto"
              />
              <button
                type="button"
                onClick={() => setOpenMenu(false)}
                aria-label={ui.closeMenu}
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md border border-on-dark/15 text-on-dark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label={ui.mobileNavigation} className="mt-8 flex flex-col">
              {nav.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpenMenu(false)}
                  className="focus-ring border-b border-on-dark/10 py-4 font-display text-lg text-on-dark"
                >
                  {link.label}
                </a>
              ))}
              <span
                aria-disabled="true"
                className="border-b border-on-dark/10 py-4 font-display text-lg text-on-dark/34"
              >
                {companyLink.label}
              </span>
              <a
                href={diagnosticLink.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpenMenu(false)}
                className="focus-ring border-b border-on-dark/10 py-4 font-display text-lg text-on-dark"
              >
                {diagnosticLink.label}
                <span className="sr-only">, {diagnosticLink.newTab}</span>
              </a>
              <p className="mt-6 font-ui text-[11px] font-semibold tracking-[0.16em] text-skybrand uppercase">
                {ui.resources}
              </p>
              {resourceLinks.map((item) => (
                item.available ? (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      track("resource_link_click", { resource: item.label, section_id: "mobile_menu" });
                      setOpenMenu(false);
                    }}
                    className="focus-ring border-b border-on-dark/10 py-3.5 font-ui text-base text-on-dark/75"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    key={item.label}
                    aria-disabled="true"
                    className="border-b border-on-dark/10 py-3.5 font-ui text-base text-on-dark/34"
                  >
                    {item.label}
                  </span>
                )
              ))}
            </nav>
            <div className="mt-8">
              <DemoButton sectionId="mobile_menu" label={ui.headerCta} className="w-full" size="lg" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
