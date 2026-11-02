# 02 — Despliegue all-in-one en Render Free (un Web Service)

Rama de trabajo: `feat/productizacion-staging`. Base visual aprobada: `segunda-version` @ `5065439`.
Estado: **imagen construida y verificada localmente, con el límite del plan Free. Sin credenciales reales, sin deploy, sin commit.**

Esta versión **sustituye** la propuesta de dos servicios (frontend y API separados) del documento 01.
El historial de decisiones anterior se conserva en `01_implementacion_staging.md` con una nota de supersedencia.

## 1. Arquitectura real implementada

```
INTERNET --HTTPS--> Render Web Service (Free, Docker)
                      |
          +-----------+-------------------------------+
          | tini (PID 1)                              |
          |  └─ scripts/start-render.sh (supervisor)  |
          |       ├─ uvicorn FastAPI  127.0.0.1:8010  |  (1 worker, sin --reload)
          |       └─ node SSR         0.0.0.0:$PORT   |  (TanStack Start, Nitro node-server)
          +-----------+-------------------------------+
                      |                |
                 Supabase (externo)   OpenRouter (externo)
```

- Solo Node escucha en el puerto público. FastAPI solo en loopback; el navegador no llega a `:8010`.
- `AGENT_API_URL=http://127.0.0.1:8010` lo fija la imagen.
- No hay PostgreSQL ni modelos locales en la imagen. No se ejecutan migraciones al arrancar.
- Frontend: TanStack Start con `nitro.preset = "node-server"` (configurado en `vite.config.ts`). No es SPA estática.

## 2. Dockerfile (raíz) — etapas

| Etapa | Base | Qué hace |
|---|---|---|
| `web-build` | `node:22-bookworm-slim` | `bun@1.3.14`, `bun install --frozen-lockfile` con `bun.lock`, `bun run build --mode forwarders-v2` → `.output/server/index.mjs`. Build de producción, sin Vite de desarrollo. |
| `api-build` | `python:3.12-slim-bookworm` | venv en `/opt/venv`, `pip install` de `backend/` (sin dependencias de desarrollo), `compileall` para arranque más rápido. |
| `runtime` | `python:3.12-slim-bookworm` | Copia el binario de Node 22 desde `web-build` (verificado: `libstdc++` presente), `tini`, `bash`, `passwd`, `ca-certificates`. Usuario `app` uid 10001, no root. Archivos de solo lectura. |

Variables de build (no de runtime): `VITE_BUILD_MODE=forwarders-v2` (la variante visual aprobada vive en `.env.forwarders-v2`), `VITE_LOGIXTIC_AGENT=true` (widget Logix Web visible), `VITE_PLANEACION_ENABLED=false` (planeación interna fuera del build público).

Archivos excluidos del contexto (`.dockerignore`): `.git`, `node_modules`, `.output`, `docs/`, `db/`, `backend/tests`, `backend/.venv`, todos los `.env*` salvo `.env.forwarders-v2` (solo flags públicos).

## 3. Supervisor (`scripts/start-render.sh`)

1. Arranca uvicorn en `127.0.0.1:8010` con `--workers 1`, sin `--reload`, sin cabecera de servidor.
2. Espera a `/api/v1/health` por reloj, con plazo de **240 s**. Sonda por `/dev/tcp`.
3. Arranca `node /srv/app/.output/server/index.mjs` con `HOST=0.0.0.0`, `PORT`.
4. `wait -n`: si muere cualquiera de los dos procesos, apaga el otro y termina con código 1 (Render reinicia).
5. SIGTERM/SIGINT: reenvía a ambos y sale con código 0.
6. `tini` como PID 1: recoge zombis y reenvía señales.
7. No imprime variables de entorno ni secretos.

## 4. Health checks

- `GET /healthz` (TanStack, ruta de servidor): responde `200 {"status":"ok","node":"ok","api":"ok"}` si FastAPI responde en `AGENT_API_URL` (timeout 2 s). Si no, `503 {"status":"degraded","api":"down"}`. No consulta Supabase ni OpenRouter. No devuelve URLs.
- `GET /api/v1/health` (FastAPI, interno): liveness del proceso.
- `GET /api/v1/ready` (FastAPI, interno): consulta Supabase solo si `LEADS_ENABLED=true`.
- Docker `HEALTHCHECK` apunta a `/healthz` (informativo; Render usa `healthCheckPath`).

## 5. Comandos

```bash
# Build (desde la raíz del repositorio)
docker build -t logixtic-staging:local .

# Ejecución local con el límite del plan Free
docker run --rm --name logixtic-staging-local \
  --memory=512m --cpus=0.1 \
  --env-file .env.container.local \
  -p 127.0.0.1:10000:10000 logixtic-staging:local
```

En esta máquina el puerto 10000 lo usa otro proyecto; para las pruebas se mapeó a `10100`/`10400`. Dentro del contenedor el servicio siempre escucha en `$PORT=10000`.

Para crear `.env.container.local` (ignorado por Git) a partir de `.env.container.example`, y generar el secreto HMAC:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## 6. Configuración exacta de Render

`render.yaml` (raíz), un único servicio:

```yaml
services:
  - type: web
    name: logixtic-staging
    runtime: docker
    plan: free
    branch: feat/productizacion-staging
    dockerfilePath: ./Dockerfile
    dockerContext: .
    healthCheckPath: /healthz
    autoDeploy: off
```

Verificación del Blueprint: `runtime: docker`, `dockerfilePath`, `dockerContext`, `branch` y `autoDeploy` se comprobaron en la documentación de Render. `autoDeploy: false` está obsoleto; se usa `off`. **No verificado en esta sesión:** que `plan: free` y `healthCheckPath` sean valores válidos del esquema vigente (la búsqueda no los confirmó). Validar en el dashboard de Render al crear el Blueprint.

Variables privadas en Render (nunca en el repo): `APP_ENV=staging`, `NODE_ENV=production`, `PORT=10000`, `HOST=0.0.0.0`, `AGENT_API_URL=http://127.0.0.1:8010`, `INTERNAL_HMAC_SECRET`, `OPENROUTER_API_KEY`, `OPENROUTER_PRIMARY_MODEL`, `OPENROUTER_FALLBACK_MODEL`, `OPENROUTER_JUDGE_MODEL`, `OPENROUTER_ENGAGEMENT_MODEL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `LEADS_ENABLED`, `PRIVACY_NOTICE_VERSION`, más los de presupuesto y timeouts de `.env.container.example`.

## 7. Resultados de pruebas (sesión actual)

| Comprobación | Resultado |
|---|---|
| `docker build -t logixtic-staging:local .` | OK (imagen final tras 6 iteraciones; errores corregidos: `knowledge_json` no empaquetado, `useradd` sin `passwd`, `PATH` sin `/usr/sbin`, espera de arranque por número de iteraciones) |
| `docker run` con `--memory=512m --cpus=0.1` | Arranca; `healthy`; OOM=false; reinicios=0 |
| Procesos | `tini` PID 1 → `start-render.sh` → `uvicorn` (127.0.0.1:8010) + `node index.mjs` (0.0.0.0:10000) |
| `/healthz` | 200 `{"status":"ok","node":"ok","api":"ok"}` |
| `/planeacion` | 404 |
| FastAPI desde el host | No accesible (`/api/v1/health` por el puerto público devuelve 404 de SSR) |
| Arranque en frío (0,1 vCPU) | `/healthz` 200 en 41, 54, 62 y 69 s según el intento. Import de FastAPI ~22 s con 0,1 vCPU frente a ~1,3 s sin límite |
| Supervisión | SIGTERM: apagado limpio, código 0, 2–3 s. Muere Node: "Node SSR terminó…; apagando FastAPI", código 1. Muere FastAPI: "FastAPI terminó…; apagando Node", código 1 |
| Hero (imagen final) | `#inicio` con `.cin-sticky`, fondo `digitalizacion.jpg`, figura `aplicacion web.jpg`, capa de red. Altura 900 px |
| Hero vs. referencia aprobada (dev, 1440×900 y 1920×1080) | Diferencia media de píxeles 0,6 y 0,3 (escala 0–255): equivalente |
| Landing 390×844, 768×1024, 1440×900, 1920×1080 | Cargan; 0 errores de consola; 0 desbordamiento horizontal |
| Chat extremo a extremo (navegador → server function → FastAPI → HTTP → respuesta) | OK con **emulador local de OpenRouter** (ver §9). Muestra "Modelo real", respuesta con fuentes aprobadas, una llamada al modelo por pregunta, sin errores de hidratación |
| Pregunta sin fuente aprobada | "No encuentro esa información…" (sin inventar) |
| Pytest backend | 98 pasan |
| Ruff backend | Sin avisos |
| `verify:content` | OK, 1284 cadenas |
| `tsc --noEmit` | OK |
| `bun run build --mode forwarders-v2` (host) | OK |
| ESLint (archivos tocados, sin la regla prettier) | 0 errores. Con prettier: los errores de CRLF son heredados del repo (ver 01) |

## 8. Consumo real de recursos (límite 512 MiB, 0,1 vCPU)

| Fase | RAM | CPU |
|---|---|---|
| Arranque (primeros segundos) | ~20 MiB | ~10 % (saturado por el arranque) |
| Operativo tras arranque | 57–73 MiB | ~10 % |
| Reposo 60 s | 63–70 MiB (≈138 MiB tras cargas de navegador) | 0,2–0,5 % |
| Primera carga de la landing | 80 MiB | 0,2 % |
| Conversación (5 preguntas) | 86–105 MiB | 6–7 % |
| Imagen final tras pruebas del Hero y chat | 146–159 MiB | 0,3–0,6 % |

Sin OOM ni reinicios en ninguna prueba. Margen: ~350 MiB sobre el límite.

**Limitación de CPU:** con 0,1 vCPU el arranque es lento (importar FastAPI y Pydantic consume ~1,3 s de CPU; con el límite son ~22 s solo de import). Es coste de las dependencias, no de la aplicación. Las páginas tardan 1–8 s en cargar en esas condiciones; el chat responde en unos 3 s por turno.

## 9. Lo que es real y lo que es emulado

- **Real en el contenedor:** Node SSR, FastAPI, la server function, el HMAC entre ambos, la lógica del agente, el presupuesto, el fallback extractivo, la supervisión de procesos.
- **Emulado:** OpenRouter. Se usó un servidor HTTP local (`localhost:9999`) que responde en formato OpenRouter, activado con `OPENROUTER_API_BASE`. **No es OpenRouter.** No hay credenciales reales ni se comprobó que los IDs de modelo existan y sean gratuitos.
- **No probado:** Supabase real (`LEADS_ENABLED=false`); la migración 0002 se probó solo en Postgres local efímero (documento 01).

## 10. Seguridad

- `/planeacion`: 404 en el build público (bandera de build; el módulo interno no entra al bundle). **Sigue sin autenticación real.**
- Documento interno `Logixtic_C4_Arquitectura_Interactiva.html`: movido de `public/` a `docs/productization/archive/`. No se sirve.
- HMAC entre SSR y FastAPI, con anti-repetición (300 s). Sin secreto en `APP_ENV=staging`, el agente responde 503 (cierre seguro).
- Identidad del visitante: se usa el **último** valor de `X-Forwarded-For` (el que añade la plataforma), nunca el primero. **Supuesto a verificar en Render**: que Render añada la IP real al final de la cabecera. No es verificable en local.
- Claves: ninguna en la imagen, en el repo, en `VITE_*` ni en el navegador. Verificado: el HTML servido no contiene `OPENROUTER`, `SUPABASE_SECRET` ni `INTERNAL_HMAC_SECRET` (se comprobó en la página servida).
- Usuario no root (uid 10001), archivos de solo lectura, sin `--proxy-headers`.
- Pendiente: cabeceras de seguridad (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`) en la respuesta de Node. No configuradas.
- `public/media/cinematic/license-manifest.json` y la carpeta `public/imagenes feedback/` se sirven públicamente. Son usados por el sitio o son de licencias; revisar con el responsable antes de publicar.

## 11. Estado de servicios externos

- **Supabase:** no conectado. `LEADS_ENABLED=false`. Pendiente: proyecto de staging, clave `sb_secret_*`, aplicar 0001 y 0002 en ese proyecto.
- **OpenRouter:** no conectado a la API real. `AGENT_DRY_RUN=false` en la prueba local solo contra el emulador. Pendiente: clave real y verificación de modelos.
- **Render:** no desplegado. `autoDeploy: off`. Pendiente: crear el servicio desde el Blueprint.

## 12. Limitaciones del plan gratuito

- Recursos: 512 MiB RAM, 0,1 vCPU. Verificado localmente; el comportamiento en Render puede diferir.
- Arranque en frío: 40–70 s en estas condiciones. Render debe aceptar ese tiempo en el health check (**no verificado**).
- Suspensión por inactividad (según la documentación de Render, **no verificado**): la primera visita tras inactividad tardaría en responder.
- Sin garantías de disponibilidad: no es un entorno de producción.

## 13. Procedimiento de rollback

1. En Render: volver al deploy anterior desde el historial (no hay autodeploy).
2. Desactivar el agente sin redeploy de código: `AGENT_DRY_RUN=true` (respuestas solo extractivas) o `AGENT_API_URL` vacío (agente no disponible).
3. Desactivar captura de prospectos: `LEADS_ENABLED=false`.
4. Ocultar el widget: requiere nuevo build con `VITE_LOGIXTIC_AGENT=false`.
5. Git: no hay commits en esta fase; el rollback de código es no desplegar la rama o eliminar la rama tras autorización.

## 14. Pendientes para pasar a producción

Bloqueantes:
1. Credenciales reales: Supabase de staging, OpenRouter, `INTERNAL_HMAC_SECRET`.
2. Verificar IDs de modelo y coste en OpenRouter (`:free`, sin cargos sin autorización).
3. Verificar en Render el origen de `X-Forwarded-For` y el tiempo de arranque en frío.
4. Aprobación del aviso de privacidad (`PRIVACY_NOTICE_VERSION`) y decisión sobre el formulario de captura.
5. `/planeacion` con autenticación real o eliminación de la ruta pública.
6. Cabeceras de seguridad en la respuesta de Node.

No bloqueantes: límites de frecuencia y presupuesto por instancia (memoria); Turnstile o WAF; retención de logs; revisión de `license-manifest.json`; normalizar finales de línea del repo (CRLF).

## 15. Git

Sin commit, sin push, sin merge, sin deploy. Instrucciones cuando se autorice (no ejecutadas):

```bash
git add -A
git commit -m "feat: despliegue all-in-one para Render Free"
git push -u origin feat/productizacion-staging
```
Después, en Render: crear el Blueprint desde `render.yaml` y completar las variables privadas de §6.
