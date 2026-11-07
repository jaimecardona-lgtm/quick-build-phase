import { useEffect, useState, type MouseEvent } from "react";
import { DEMO_URL, withUtm } from "@/lib/logixtic";
import { track } from "@/lib/analytics";

/* UTM calculados tras el montaje: el HTML del servidor usa la URL base y no provoca desajustes de hidratación. */
export function useDemoUrl(): string {
  const [href, setHref] = useState(DEMO_URL);
  useEffect(() => {
    setHref(withUtm(DEMO_URL, window.location.search));
  }, []);
  return href;
}

/* Abre el AgentWidget existente (sin duplicarlo ni alterarlo) y registra el evento. */
export function openLogixWidget(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
  event.preventDefault();
  track("zenox_logix_open", { section_id: sectionId });
  const opener = Array.from(document.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("Preguntar a Logix Web"),
  );
  opener?.click();
}
