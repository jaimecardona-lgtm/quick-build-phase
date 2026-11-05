# Plan de staging independiente para `/zenox-preview`

Estado: **plan, no ejecutado.** No se han creado servicios Render, no hay deploy, no hay commits.

## 0. Hallazgos que condicionan el plan

- La infraestructura de despliegue (`Dockerfile`, `.dockerignore`, `render.yaml`, `scripts/start-render.sh`, `src/routes/healthz.ts`, `.env.forwarders-v2`) está **versionada en `feat/zenox-logixtic-v1`** (repo principal) y en `feat/productizacion-staging`. **No existe en la rama de preview** (`feat/logixtic-zenox-local-preview`).
- El `Dockerfile` del repo principal tiene cambios **sin commitear** (variable `VITE_LOGIXTIC_HOME`). No debe construirse una imagen de staging desde un estado no versionado.
- El backend de la rama principal (`backend/app`) es **bastante más avanzado** que el de la rama de preview: incluye `ready.py`, `leads.py`, `gateway.py`, `budget.py`, `conversation.py`, `rag_retriever.py`, `supabase_client.py`, `tavily_client.py`, `embeddings.py`. La prueba de Logix de esta fase usó el backend del worktree de preview (base en dry-run), por lo que **valida conectividad y estados, no la versión que iría a staging**.
- `render.yaml` apunta a `branch: feat/productizacion-staging` y `autoDeploy: off`. Un servicio nuevo debe declarar su propia rama.

## 1. Archivos necesarios en la rama de staging

Decisión previa: elegir **una** rama de integración (recomendado: consolidar en la rama de preview tras revisión, no copiar archivos sueltos). Cambios mínimos:

| Archivo | Origen | Acción |
| --- | --- | --- |
| `Dockerfile` | repo principal (commit versionado, sin el cambio no commiteado) | Traer tal cual y revisar `VITE_LOGIXTIC_HOME`. |
| `.dockerignore` | repo principal | Traer. Excluye `.env.*` salvo `.env.forwarders-v2`. |
| `render.yaml` | repo principal | **No sobrescribir** el servicio de producción. Añadir un servicio nuevo `logixtic-zenox-staging` con su rama. |
| `scripts/start-render.sh` | repo principal | Traer. Supervisa Node (`$PORT`) y FastAPI (`127.0.0.1:8010`). |
| `src/routes/healthz.ts` | repo principal | Traer. Sin esta ruta, el `healthCheckPath: /healthz` falla. |
| `.env.forwarders-v2` | repo principal | Traer. Solo flags públicos (`MOTION_V2=true`, `AGENT=true`). |
| `backend/` | repo principal | Reconciliar: la imagen ejecuta `app.main:app` y el Dockerfile hace `import app.main`. Usar la versión de la rama principal. |
| `src/routes/zenox-preview.tsx` y `src/components/zenox-preview/*` | rama de preview | Ya existen. |
| `src/lib/zenox-flag.ts` | repo principal (sin trackear) | Solo si se usa el flag `VITE_LOGIXTIC_HOME=zenox`. Decidir antes. |

Verificar con `diff` antes de integrar. No copiar `docs/`, `db/`, `scripts/*` distintos de `start-render.sh` (ya excluidos por `.dockerignore`).

## 2. Comandos de build e inicio

Build (dentro de la imagen, etapa `web-build`):

```bash
bun install --frozen-lockfile
bun run build --mode forwarders-v2        # genera .output/server/index.mjs
```

Dependencias de FastAPI (etapa `api-build`): `pip install /src/backend` y `python -c "import app.main"`.

Inicio (CMD de la imagen):

```bash
/srv/app/scripts/start-render.sh
#   node /srv/app/.output/server/index.mjs        (0.0.0.0:$PORT)
#   /opt/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8010
```

Prueba local equivalente (sin Docker): `npx vite build --mode forwarders-v2`, después `PORT=10000 node .output/server/index.mjs` y en `backend/` `uvicorn app.main:app --port 8010` con `AGENT_DRY_RUN=true`. **Docker no se ejecutó en esta fase; el build de imagen queda sin verificar.**

## 3. Variables no secretas (Render → Environment, sin `VITE_` salvo build args)

Build args (Docker build args, visibles en el build):

- `VITE_BUILD_MODE=forwarders-v2` → activa `.env.forwarders-v2`.
- `VITE_LOGIXTIC_AGENT=true` → widget Logix visible.
- `VITE_PLANEACION_ENABLED=false`.
- `VITE_LOGIXTIC_HOME=` (vacío) salvo que se decida usar el flag `zenox`.
- **No definir** `VITE_LOGIXTIC_CINEMATIC_VIDEO_APPROVED` (vídeos apagados mientras no haya licencia aprobada).

Variables de runtime:

- `APP_ENV=staging`.
- `AGENT_DRY_RUN=true` (sin llamadas de pago a OpenRouter).
- `CORS_ALLOW_ORIGINS=https://<host-staging>.onrender.com` (lista explícita, nunca `*`).
- `CHAT_RATE_LIMIT_PER_MINUTE=10`, `CHAT_MAX_CHARS=800`.
- `OPENROUTER_PRIMARY_MODEL=` y `OPENROUTER_FALLBACK_MODEL=` vacíos.
- Captura de leads / Supabase **desactivada** (no configurar URL ni claves; `ready.py` responde `ready` si `leads_enabled` es falso).
- Tavily desactivado (sin clave; el servicio es de pago).

`PORT`, `HOST`, `AGENT_API_URL` ya los fija la imagen/script.

## 4. Secretos (Render secret env, nunca en `VITE_*`)

Separados de producción, con valores nuevos generados para staging:

- `INTERNAL_HMAC_SECRET`: lo leen el servidor TanStack (`agent.functions.ts`) y FastAPI para firmar/validar. Debe ser distinto del de producción.
- `OPENROUTER_API_KEY`: **dejar vacía** en staging mientras no se apruebe gasto. Si se define, se activan llamadas de pago.
- Claves Supabase y Tavily: no definir.

Regla: ninguna clave en `.env.example`, en el repo ni en variables `VITE_*`.

## 5. Verificación de `/healthz`

```bash
curl -i https://<host-staging>/healthz
# 200 {"status":"ok","node":"ok","api":"ok"}  -> Node y FastAPI operativos
# 503 {"status":"degraded","node":"ok","api":"down"} -> FastAPI no responde
```

Render reinicia el contenedor si `/healthz` no responde. El script espera hasta `API_READY_TIMEOUT` (600 s por defecto).

## 6. Prueba de la ruta `/zenox-preview`

```bash
curl -I https://<host-staging>/zenox-preview        # 200
QA_BASE=https://<host-staging> QA_PATH=/zenox-preview python qa_zenox.py desktop tablet phone reduced
```

Criterios: 0 errores de consola y de página, 0 px de desbordamiento, 0 imágenes rotas, reveals visibles, Logix en estado "DRY-RUN" con respuesta del contenido aprobado. Repetir también `/` para confirmar que la Home sigue funcionando.

## 7. Protección contra acceso público no autorizado

`noindex` **no protege** el contenido: solo pide a los buscadores que no indexen. Medidas necesarias:

1. **Acceso restringido (requiere decisión):** autenticación HTTP Basic o cabecera de acceso implementada en el servidor Node (middleware de Nitro / `src/server.ts`), con credencial en secreto `STAGING_BASIC_AUTH`. Sin esto, la URL de Render es pública. No he verificado qué control de acceso ofrece Render en el plan usado (`plan: free` en `render.yaml`); asumir que hay que implementarlo en la aplicación hasta comprobarlo.
2. Cabecera `X-Robots-Tag: noindex, nofollow` a nivel de servidor (además de la meta).
3. No enlazar staging desde producción, no añadir a sitemap, no asignar dominio personalizado.
4. Nombre de servicio no predecible y sin datos reales: sin base de datos, sin leads, sin claves de pago.
5. Mantener el aviso visible de "revisión comercial, no publicado" (ya implementado).

## 8. Mantener intacto el servicio productivo

- Servicio Render nuevo e independiente; no modificar el servicio existente ni su bloque en `render.yaml`.
- Rama propia para staging; no tocar `main` ni la rama productiva.
- `autoDeploy: off` en staging; despliegue manual tras revisión.
- Variables y secretos separados (regenerados).
- Sin conexión a la base de datos productiva ni a Supabase productivo.
- Comprobar `/healthz` y `/` del servicio productivo antes y después de cada despliegue de staging.

## 9. Bloqueos actuales

1. Decidir la rama de integración y reconciliar backend y Dockerfile (sección 0).
2. Decidir el mecanismo de acceso restringido (sección 7.1); no existe aún.
3. Aprobar EN y PT-BR (borradores en `src/components/zenox-preview/zenox-preview-copy.ts`).
4. Autorizaciones pendientes: logos, testimonios y casos de cliente; licencias de vídeo.
5. Cifras de impacto `[VALIDAR]` (ocultas en la preview).
6. Crear el servicio Render (no realizado a propósito) y generar los secretos de staging.
7. Validar la imagen Docker (no ejecutada en esta fase).
