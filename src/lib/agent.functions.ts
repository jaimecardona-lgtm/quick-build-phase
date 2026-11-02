/*
 * Funciones de servidor (TanStack Start) que conectan el widget con el backend FastAPI.
 * - Solo el servidor lee AGENT_API_URL e INTERNAL_HMAC_SECRET (sin prefijo VITE_, nunca al navegador).
 * - Las peticiones van firmadas con HMAC-SHA256 cuando hay secreto; el backend valida firma y antigüedad.
 * - Timeout explícito y errores mapeados a códigos; el texto visible lo localiza el componente.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

// Debe superar AGENT_TOTAL_TIMEOUT_SECONDS del backend (9 s) con margen: así el usuario recibe
// siempre la respuesta del backend (incluida la extractiva) antes de que expire esta espera.
const CHAT_TIMEOUT_MS = 12_000;
const DEFAULT_AGENT_URL = "http://127.0.0.1:8010";

export type AgentErrorCode = "unavailable" | "rate_limited" | "invalid" | "misconfigured" | "error";

export type ChatResult =
  | {
      ok: true;
      text: string;
      sources: string[];
      model: string;
      dryRun: boolean;
      degraded: boolean;
      refused: boolean;
    }
  | { ok: false; code: AgentErrorCode };

export type AgentStatus =
  | { ok: true; dryRun: boolean; knowledgeVersion: string; signatureRequired: boolean }
  | { ok: false; code: AgentErrorCode };

export type RoiResult =
  | {
      ok: true;
      grossMonthlySaving: string;
      netMonthlySaving: string | null;
      assumptionsVersion: string;
    }
  | { ok: false; code: AgentErrorCode };

const ChatInput = z.object({
  message: z.string().trim().min(1).max(800),
  locale: z.enum(["es", "en", "pt-BR"]).default("es"),
});

const RoiInput = z.object({
  monthlyOperations: z.number().int().min(1).max(100000),
  manualHoursPerOperation: z.number().min(0.01).max(200),
  loadedHourlyCost: z.number().min(0.01).max(10000),
  reductionAssumptionPct: z.number().min(0).max(100),
  logixticMonthlyCost: z.number().min(0).max(10000000).optional(),
});

function backend(): { baseUrl: string; secret: string } {
  const configured = process.env["AGENT_API_URL"];
  // Fuera de desarrollo nunca se usa localhost: sin AGENT_API_URL el agente queda no disponible.
  const production = process.env["NODE_ENV"] === "production";
  const baseUrl = configured
    ? configured.replace(/\/$/, "")
    : production
      ? ""
      : DEFAULT_AGENT_URL;
  return { baseUrl, secret: process.env["INTERNAL_HMAC_SECRET"] ?? "" };
}

/**
 * Clave de cuota del visitante. Render añade la IP real del cliente AL FINAL de X-Forwarded-For;
 * el primer valor lo puede falsear el visitante, así que solo se usa el último.
 * Supuesto a verificar en Render antes de producción (ver docs/productization/02_render_all_in_one.md).
 * Se envía dentro del cuerpo firmado y se guarda solo como hash truncado.
 */
async function visitorKey(): Promise<string | undefined> {
  const forwarded = getRequestHeader("x-forwarded-for");
  const ip = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).pop();
  if (!ip || !/^[0-9a-fA-F:.]{2,45}$/.test(ip)) return undefined;
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

async function callBackend(
  method: "GET" | "POST",
  path: string,
  payload?: unknown,
): Promise<{ status: number; json: unknown } | { status: 0 }> {
  const { baseUrl, secret } = backend();
  if (!baseUrl) return { status: 503, json: null };
  const body = payload === undefined ? "" : JSON.stringify(payload);
  const headers: Record<string, string> = {};
  if (payload !== undefined) headers["Content-Type"] = "application/json";
  if (secret && payload !== undefined) {
    const { createHmac } = await import("node:crypto");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    headers["X-Logixtic-Timestamp"] = timestamp;
    headers["X-Logixtic-Signature"] = createHmac("sha256", secret)
      .update(`${timestamp}.${body}`)
      .digest("hex");
  }
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: payload === undefined ? null : body,
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
    });
    return { status: response.status, json: await response.json().catch(() => null) };
  } catch {
    return { status: 0 };
  }
}

function codeFor(status: number): AgentErrorCode {
  if (status === 0 || status === 503 || status >= 500) return "unavailable";
  if (status === 429) return "rate_limited";
  if (status === 401) return "misconfigured";
  if (status === 422) return "invalid";
  return "error";
}

export const askCommercialAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }): Promise<ChatResult> => {
    const response = await callBackend("POST", "/api/v1/ai/chat", {
      ...data,
      client_key: await visitorKey(),
    });
    if (response.status !== 200) return { ok: false, code: codeFor(response.status) };
    const json = response.json as Record<string, unknown> | null;
    if (!json || typeof json["text"] !== "string") return { ok: false, code: "error" };
    return {
      ok: true,
      text: json["text"] as string,
      sources: Array.isArray(json["sources"]) ? (json["sources"] as unknown[]).map(String) : [],
      model: String(json["model"] ?? "none"),
      dryRun: Boolean(json["dry_run"]),
      degraded: Boolean(json["degraded"]),
      refused: Boolean(json["refused"]),
    };
  });

export const getCommercialAssistantStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<AgentStatus> => {
    const response = await callBackend("GET", "/api/v1/ai/health");
    if (response.status !== 200) return { ok: false, code: codeFor(response.status) };
    const json = response.json as Record<string, unknown> | null;
    if (!json) return { ok: false, code: "error" };
    return {
      ok: true,
      dryRun: Boolean(json["dry_run"]),
      knowledgeVersion: String(json["knowledge_version"] ?? ""),
      signatureRequired: Boolean(json["signature_required"]),
    };
  },
);

export const calculateRoi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RoiInput.parse(input))
  .handler(async ({ data }): Promise<RoiResult> => {
    const payload = {
      monthly_operations: data.monthlyOperations,
      manual_hours_per_operation: String(data.manualHoursPerOperation),
      loaded_hourly_cost: String(data.loadedHourlyCost),
      reduction_assumption_pct: String(data.reductionAssumptionPct),
      logixtic_monthly_cost:
        data.logixticMonthlyCost === undefined ? null : String(data.logixticMonthlyCost),
    };
    const response = await callBackend("POST", "/api/v1/roi/calculate", payload);
    if (response.status !== 200) return { ok: false, code: codeFor(response.status) };
    const json = response.json as Record<string, unknown> | null;
    if (!json) return { ok: false, code: "error" };
    return {
      ok: true,
      grossMonthlySaving: String(json["gross_monthly_saving"]),
      netMonthlySaving:
        json["net_monthly_saving"] === null || json["net_monthly_saving"] === undefined
          ? null
          : String(json["net_monthly_saving"]),
      assumptionsVersion: String(json["assumptions_version"] ?? ""),
    };
  });
