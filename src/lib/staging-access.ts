/*
 * Control de acceso restringido para entornos de staging. Solo servidor (Node).
 *
 * Variables (runtime, NUNCA VITE_*):
 * - STAGING_ACCESS_MODE: "off" (por defecto) o "basic".
 * - STAGING_BASIC_AUTH: "usuario:contraseña" (secreto). Obligatoria si el modo es "basic".
 *
 * Comportamiento:
 * - Modo "off": no hace nada. Producción y desarrollo no cambian.
 * - Modo "basic" sin credencial configurada: 503 en todas las rutas (cierre por defecto).
 * - Modo "basic": cualquier petición exige HTTP Basic, incluidos HTML, assets de la app
 *   y funciones de servidor. La comprobación ocurre antes de entregar cualquier respuesta de la aplicación.
 * - /healthz queda exento: solo devuelve estado (ok/degraded) para que Render compruebe el contenedor.
 * - Todas las respuestas en modo "basic" llevan X-Robots-Tag: noindex, nofollow (defensa adicional, no única).
 *
 * La comparación usa SHA-256 + timingSafeEqual para evitar fugas por tiempo.
 * Nunca registra credenciales ni las incluye en las respuestas.
 */
import { createHash, timingSafeEqual } from "node:crypto";

export type AccessMode = "off" | "basic";

type Env = Record<string, string | undefined>;

const EXEMPT_PATHS = new Set(["/healthz"]);

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function parseAccessMode(env: Env): AccessMode {
  const raw = (env["STAGING_ACCESS_MODE"] ?? "off").trim().toLowerCase();
  return raw === "basic" ? "basic" : "off";
}

function expectedCredential(env: Env): string | null {
  const value = env["STAGING_BASIC_AUTH"];
  if (!value || !value.includes(":")) return null;
  return value;
}

function isAuthorized(header: string | null, expected: string): boolean {
  if (!header || !header.toLowerCase().startsWith("basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  return timingSafeEqual(digest(decoded), digest(expected));
}

function noindex(response: Response): Response {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/**
 * Devuelve una Response si la petición debe detenerse aquí, o null si puede continuar.
 */
export function checkStagingAccess(request: Request, env: Env = process.env): Response | null {
  if (parseAccessMode(env) !== "basic") return null;

  const path = new URL(request.url).pathname;
  if (EXEMPT_PATHS.has(path)) return null;

  const expected = expectedCredential(env);
  if (!expected) {
    return noindex(
      new Response("Servicio no configurado.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }),
    );
  }

  if (isAuthorized(request.headers.get("authorization"), expected)) return null;

  return noindex(
    new Response("Acceso restringido.", {
      status: 401,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "www-authenticate": 'Basic realm="Logixtic staging", charset="UTF-8"',
      },
    }),
  );
}

/** Añade X-Robots-Tag a respuestas permitidas en modo "basic" (reconstruye la Response: las cabeceras pueden ser inmutables). */
export function withStagingHeaders(response: Response, env: Env = process.env): Response {
  if (parseAccessMode(env) !== "basic") return response;
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
