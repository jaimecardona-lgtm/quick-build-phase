import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoUrl } from "@/hooks/use-demo-url";
import { track } from "@/lib/analytics";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  sectionId: string;
  size?: "default" | "lg";
  className?: string;
};

export function DemoButton({ sectionId, size = "default", className }: Props) {
  const demoUrl = useDemoUrl();
  const { content } = useLanguage();

  return (
    <Button
      asChild
      size={size}
      className={cn(
        "group min-h-11 rounded-md bg-amber px-5 font-ui font-semibold text-night hover:bg-amber/90",
        className,
      )}
    >
      <a
        href={demoUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("demo_cta_click", { section_id: sectionId })}
      >
        {content.demoLabel}
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </a>
    </Button>
  );
}
