import { DEMO_URL } from "@/lib/logixtic";

const links = [
  { label: "Plataforma", href: "#plataforma" },
  { label: "Logix AI", href: "#plataforma" },
  { label: "Clientes", href: "#plataforma" },
  { label: "Implementación", href: "#plataforma" },
  { label: "Recursos", href: "#plataforma" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-royal md:h-[76px]">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#top" className="flex items-center focus-ring rounded-md">
          <img
            src="/assets/logixtic-logo-negativo-transparente.png"
            alt="Logixtic"
            width={1520}
            height={465}
            className="h-6 w-auto md:h-7"
          />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="focus-ring rounded-md px-1 py-2 font-ui text-sm text-white/85 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href={DEMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex min-h-11 items-center rounded-lg bg-amber px-4 py-2.5 font-ui text-sm font-semibold text-night transition-colors hover:bg-amber/90"
        >
          <span className="hidden sm:inline">Agenda una demo personalizada</span>
          <span className="sm:hidden">Agenda una demo</span>
        </a>
      </div>
    </header>
  );
}
