import { Button } from "@/components/ui/button";
import { useDemoUrl } from "@/hooks/use-demo-url";

const links = [
  { label: "Plataforma", href: "#plataforma" },
  { label: "Operación", href: "#operacion" },
  { label: "Freight Journey", href: "#freight-journey" },
  { label: "Logix AI", href: "#logix" },
];

export function Header() {
  const demoUrl = useDemoUrl();

  return (
    <header className="sticky top-0 z-50 h-[72px] w-full border-b border-on-dark/10 bg-night/92 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1360px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#top" className="focus-ring flex items-center rounded-md" aria-label="Logixtic, inicio">
          <img src="/assets/logixtic-logo-negativo-transparente.png" alt="Logixtic" width={1520} height={465} className="h-6 w-auto md:h-7" />
        </a>
        <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="focus-ring rounded-md px-1 py-2 font-ui text-sm text-on-dark/68 transition-colors hover:text-on-dark">
              {link.label}
            </a>
          ))}
        </nav>
        <Button asChild className="min-h-10 rounded-md bg-amber px-4 font-ui font-semibold text-night hover:bg-amber/90">
          <a href={demoUrl} target="_blank" rel="noopener noreferrer">Demo Estratégica</a>
        </Button>
      </div>
    </header>
  );
}