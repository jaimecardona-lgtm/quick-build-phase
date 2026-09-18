/** Envío de eventos de conversión sin romper la analítica existente. */
type Payload = Record<string, string | number | boolean>;

interface AnalyticsWindow extends Window {
  dataLayer?: Payload[];
}

export function track(event: string, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...payload });
}
