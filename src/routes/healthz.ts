import { createFileRoute } from "@tanstack/react-router";

/*
 * GET /healthz: salud del contenedor para Render.
 * - Node responde (si esta función se ejecuta, el proceso SSR está vivo).
 * - FastAPI responde en AGENT_API_URL (127.0.0.1:8010 dentro del contenedor).
 * No consulta Supabase ni OpenRouter. No devuelve URLs, secretos ni detalles de error.
 */
const DEFAULT_AGENT_URL = "http://127.0.0.1:8010";
const PROBE_TIMEOUT_MS = 2_000;

async function apiIsUp(): Promise<boolean> {
  const configured = process.env["AGENT_API_URL"];
  const baseUrl = (configured ?? DEFAULT_AGENT_URL).replace(/\/$/, "");
  try {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      method: "GET",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/healthz")({
  server: {
    handlers: {
      GET: async () => {
        const api = await apiIsUp();
        const body = { status: api ? "ok" : "degraded", node: "ok", api: api ? "ok" : "down" };
        return new Response(JSON.stringify(body), {
          status: api ? 200 : 503,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
