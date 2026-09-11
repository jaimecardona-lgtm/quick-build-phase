/**
 * Shared constants for the Logixtic home experience.
 * The demo CTA preserves any UTM parameters present on the current URL.
 */
export const DEMO_BASE_URL = "https://meetings.hubspot.com/carlossalazar/diagnostico";

export const DEMO_URL = DEMO_BASE_URL;

export function withUtm(baseUrl: string, search: string): string {
  if (!search) return baseUrl;
  const incoming = new URLSearchParams(search);
  const keep = new URLSearchParams();
  incoming.forEach((value, key) => {
    if (key.toLowerCase().startsWith("utm_") || key === "gclid" || key === "fbclid") {
      keep.set(key, value);
    }
  });
  const qs = keep.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}
