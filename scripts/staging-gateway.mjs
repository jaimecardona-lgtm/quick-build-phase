// Gateway de acceso restringido para staging (Opción A de la fase 3F).
//
// Se sitúa delante del servidor Nitro: TODA petición (HTML, JS, CSS, imágenes, funciones de servidor)
// pasa por aquí antes de llegar a Nitro. Nitro sirve sus estáticos antes que cualquier middleware de la
// aplicación, por eso el control no puede vivir solo en src/server.ts.
//
// Variables (runtime, nunca VITE_*):
//   PORT                 puerto público (lo asigna Render)
//   GATEWAY_HOST         interfaz de escucha (por defecto 0.0.0.0)
//   UPSTREAM_PORT        puerto interno donde escucha Nitro (127.0.0.1)
//   STAGING_BASIC_AUTH   "usuario:contraseña". Obligatoria. Sin ella: cierre seguro (503).
//
// Reglas:
//   - /healthz queda exento: lo usa Render y Nitro solo devuelve estado (ok/degraded).
//   - Sin credencial válida: 401 con WWW-Authenticate. Las credenciales no se registran.
//   - Comparación con SHA-256 + timingSafeEqual.
//   - La cabecera Authorization se reenvía intacta: src/lib/staging-access.ts la valida también.
//   - Sin dependencias externas (solo módulos de Node).

import http from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";

const PORT = Number(process.env.PORT ?? 10000);
const HOST = process.env.GATEWAY_HOST ?? "0.0.0.0";
const UPSTREAM_HOST = "127.0.0.1";
const UPSTREAM_PORT = Number(process.env.UPSTREAM_PORT ?? 10001);
const CREDENTIAL = process.env.STAGING_BASIC_AUTH ?? "";
const EXEMPT_PATHS = new Set(["/healthz"]);

if (!Number.isInteger(PORT) || !Number.isInteger(UPSTREAM_PORT)) {
  console.error("[gateway] PORT o UPSTREAM_PORT no válidos");
  process.exit(1);
}

const credentialConfigured = CREDENTIAL.includes(":");

function digest(value) {
  return createHash("sha256").update(value, "utf8").digest();
}

function isAuthorized(header) {
  if (!credentialConfigured || typeof header !== "string") return false;
  if (!/^basic\s/i.test(header)) return false;
  const decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  return timingSafeEqual(digest(decoded), digest(CREDENTIAL));
}

function respond(res, status, extraHeaders, body) {
  res.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "x-robots-tag": "noindex, nofollow",
    "cache-control": "no-store",
    ...extraHeaders,
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://gateway.local").pathname;

  if (!EXEMPT_PATHS.has(path)) {
    if (!credentialConfigured) {
      respond(res, 503, {}, "Servicio no configurado.\n");
      req.resume();
      return;
    }
    if (!isAuthorized(req.headers.authorization)) {
      respond(res, 401, { "www-authenticate": 'Basic realm="Logixtic staging", charset="UTF-8"' }, "Acceso restringido.\n");
      req.resume();
      return;
    }
  }

  const upstream = http.request(
    {
      host: UPSTREAM_HOST,
      port: UPSTREAM_PORT,
      method: req.method,
      path: req.url,
      headers: {
        ...req.headers,
        "x-forwarded-proto": "https",
        "x-forwarded-for": req.socket.remoteAddress ?? "",
      },
    },
    (upRes) => {
      res.writeHead(upRes.statusCode ?? 502, {
        ...upRes.headers,
        "x-robots-tag": "noindex, nofollow",
      });
      upRes.pipe(res);
    },
  );

  upstream.on("error", () => {
    if (!res.headersSent) respond(res, 502, {}, "Servicio no disponible.\n");
    else res.destroy();
  });

  req.pipe(upstream);
});

server.listen(PORT, HOST, () => {
  console.log(`[gateway] escuchando en ${HOST}:${PORT} -> Nitro ${UPSTREAM_HOST}:${UPSTREAM_PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
