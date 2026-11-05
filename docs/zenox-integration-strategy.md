# Estrategia de integración: frontend Zenox + backend y Render

Estado: **estrategia verificada en modo lectura (dry-run), sin ramas creadas, sin commits, sin deploy.**

## 1. Hechos de las ramas (verificados con git)

| Rama / commit | Qué es | Relación |
| --- | --- | --- |
| `main` `f4b1d03` | Producción de referencia | 10 commits por detrás de v1 |
| `feat/zenox-logixtic-v1` `12832f9` | **Base real del despliegue actual**: backend avanzado (RAG, Supabase, presupuesto, Tavily, `ready.py`, `leads.py`), `Dockerfile`, `render.yaml`, `healthz.ts`, `start-render.sh`, `.env.forwarders-v2`, `ZenoxHome` | Tip de trabajo |
| `feat/productizacion-staging` `12832f9` | Rama que referencia `render.yaml` | **Mismo commit que v1**: no hay divergencia |
| `feat/logixtic-zenox-local-preview` `effc963` | Frontend Zenox de la preview | **Sin commits propios**: `effc963` es ancestro de v1. Todo el trabajo de esta fase está **sin commitear** en el worktree |

Conclusión: la base correcta para staging es **`12832f9`** (v1 = productizacion-staging). El backend de referencia es el de v1. El backend del worktree de preview es una versión anterior y **no debe desplegarse**.

## 2. Qué frontend trasladar

Parche generado con índice temporal (no toca el índice real):
`C:\Users\maura\AppData\Local\Temp\claude\a00595779095890a\11fd6032-c041-49f6-81ec-6c3c7ff26bec\scratchpad\zenox-preview-frontend.patch`
(18 archivos; base `effc963`; excluye backend, `node_modules` y `.output`).

Archivos del parche:

- Nuevos: `src/routes/zenox-preview.tsx`, `src/components/zenox-preview/*` (Hero, Platform, Services, copy, CSS), `src/lib/staging-access.ts`, `docs/zenox-preview-staging-plan.md`, `docs/zenox-integration-strategy.md`.
- Modificados compartidos: `Header.tsx` (prop `navLinks`), `Flow.tsx` (prop `showResults`), `Plans.tsx` (prop `reviewMode`), `Evidence.tsx` (prop `showMetrics`), `Hero.tsx` (prop `titleOverride`), `CinematicBackgroundSequence.tsx` (gate de vídeo), `use-reveal.ts`, `styles.css`, `server.ts` (control de acceso).
- **Excluir y regenerar:** `src/routeTree.gen.ts` (archivo generado; se regenera con el build de TanStack Router).

## 3. Dry-run de integración sobre v1 (verificado)

Prueba: worktree temporal de `12832f9`, `git apply --3way --exclude=src/routeTree.gen.ts`. El worktree temporal se eliminó después; ninguna rama cambió.

- Aplican limpiamente: `Header`, `Flow`, `Evidence`, `Hero`, `CinematicBackgroundSequence`, `use-reveal`, `styles.css`, `server.ts`, y los archivos nuevos.
- **Conflicto único: `src/components/site/Plans.tsx`** (4 bloques). v1 cambió el fondo de Plans (8 líneas): `FORWARDERS_V2 ? <DataNetworkLayer variant="rails" /> : <CinematicBackgroundSequence …/>`. Resolución: **conservar el bloque de fondo de v1** y reaplicar a mano solo la prop `reviewMode` (filtro de 24/7, badge oculto y frase de certificación). El fondo de v1 es mejor para la licencia: `DataNetworkLayer` no usa vídeo.
- `src/routes/index.tsx` no se toca en el parche: sin conflicto. El flag `VITE_LOGIXTIC_HOME=zenox` de v1 sigue funcionando.

## 4. Procedimiento reproducible (cuando se autorice)

1. Crear rama nueva **desde `12832f9`**, p. ej. `staging/zenox-preview` (no reutilizar `main` ni `feat/zenox-logixtic-v1`).
2. Aplicar el parche con `git apply --3way --exclude=src/routeTree.gen.ts`.
3. Resolver `Plans.tsx` según la sección 3.
4. Regenerar `src/routeTree.gen.ts` con `vite build` (o `vite dev` una vez) y revisar el diff.
5. Verificar en la rama: `tsc --noEmit`, `verify:content`, build, pruebas del preview, `/` sin cambios.
6. Commit en la rama de staging (solo entonces, con autorización) y push a remoto de staging.

Operaciones destructivas que **no** se hacen: reset, force push, rebase de ramas publicadas, sobrescritura de `render.yaml` o `Dockerfile`.

## 5. Configuración de build que debe quedar fijada

**Hallazgo bloqueante verificado:** con `vite build` normal, Nitro genera el preset `cloudflare-module` aunque `vite.config.ts` pida `node-server` (el wrapper de Lovable no lo aplica). Con ese output, `node .output/server/index.mjs` **no arranca ningún servidor** (sale con código 0). Con `NITRO_PRESET=node-server` sí arranca y sirve `/zenox-preview` (200).

El `Dockerfile` de v1 **no define `NITRO_PRESET`**. Debe añadirse en la etapa `web-build`:

```dockerfile
ENV NITRO_PRESET=node-server
```

El smoke test del Dockerfile (`test -f .output/server/index.mjs`) no lo detecta: el archivo existe en ambos presets. Añadir como prueba: `node -e "require('./.output/nitro.json')"` y comprobar `preset === "node-server"`, o arrancar el servidor y consultar `/`.

## 6. Variables de build y runtime

Verificadas en el código:

| Variable | Dónde se lee | Valor en staging | Efecto |
| --- | --- | --- | --- |
| `VITE_BUILD_MODE` (ARG) | Dockerfile → `--mode` | `forwarders-v2` | Carga `.env.forwarders-v2` |
| `VITE_LOGIXTIC_MOTION_V2` | `src/lib/cinematic-assets.ts` | `true` (vía `.env.forwarders-v2`) | Globo, Hero cinematográfico y capas de movimiento |
| `VITE_LOGIXTIC_AGENT` | `AgentWidget.tsx` | `true` | Widget Logix visible en producción |
| `VITE_LOGIXTIC_CINEMATIC_VIDEO_APPROVED` | `CinematicBackgroundSequence.tsx` | **no definir** | Vídeos apagados (sin licencia aprobada) |
| `VITE_LOGIXTIC_HOME` | `src/lib/zenox-flag.ts` (v1) | vacío | Home `/` original; `zenox` cambia la Home |
| `VITE_PLANEACION_ENABLED` | `vite.config.ts` | `false` | Herramienta interna fuera del bundle |

Reglas:

- **Cambiar una variable `VITE_*` exige reconstruir la imagen.** Son constantes que Vite incrusta en el bundle durante el build; cambiarlas en el panel de Render sin reconstruir no tiene efecto.
- Ninguna clave secreta debe tener prefijo `VITE_`; todo lo que tenga prefijo termina en el navegador.
- El `.dockerignore` de v1 excluye `.env.*` salvo `.env.forwarders-v2`. No copiar `.env` locales.

Variables de runtime (no `VITE_`):

- `APP_ENV=staging`, `AGENT_DRY_RUN=true`, `CORS_ALLOW_ORIGINS` (host de staging), `CHAT_RATE_LIMIT_PER_MINUTE=10`, `CHAT_MAX_CHARS=800`.
- `STAGING_ACCESS_MODE=basic` (ver sección 7).
- Secretos: `STAGING_BASIC_AUTH`, `INTERNAL_HMAC_SECRET` (nuevo, distinto de producción). Sin `OPENROUTER_API_KEY`, Supabase ni Tavily.

## 7. Control de acceso en servidor (implementado y probado)

Implementado en `src/lib/staging-access.ts` y conectado en `src/server.ts`, delante de cualquier respuesta de la aplicación.

Comportamiento (probado contra el servidor `node-server` con `curl`):

| Caso | Resultado |
| --- | --- |
| `/zenox-preview` sin credencial, modo `basic` | **401** + `WWW-Authenticate` + `X-Robots-Tag: noindex, nofollow` |
| Credencial incorrecta | **401** |
| Credencial correcta | **200** + `X-Robots-Tag` |
| `/` sin credencial | **401** |
| Función de servidor (`/_serverFn/…`) sin credencial | **401** |
| Modo `basic` sin `STAGING_BASIC_AUTH` | **503** (cierre por defecto) |
| Modo `off` (por defecto) | **200** sin cambios (producción y desarrollo no afectados) |
| `/healthz` | Exento (solo devuelve estado). En v1 existe; en la rama de preview no hay ruta, así que da 404 hasta integrar `healthz.ts`. |

Comparación de credenciales con SHA-256 + `timingSafeEqual`. No se registran credenciales.

**Límite no resuelto: recursos estáticos.** `GET /assets/06-costos-operacion.webp` responde **200 sin credencial**. Motivo verificado: Nitro registra el servido de `public/` con `unshift` **antes** de cualquier middleware de la aplicación (`node_modules/nitro/dist/_chunks/nitro.mjs`, líneas ~788–793), así que el wrapper de `fetch` no lo ve.

Opciones para cerrarlo (decisión pendiente):

1. **Recomendada:** poner el servicio de staging detrás de un control de acceso externo al contenedor (proxy o acceso con identidad delante del host). Cubre todo el tráfico, incluidos estáticos.
2. Dentro de la app: `serveStatic: false` en la configuración de Nitro para el build de staging, y servir `public/` desde el wrapper tras la comprobación. Requiere cambiar la configuración de build y probarla completa.
3. Reducir lo expuesto: el contenido de `public/` se publica sin control (ver sección 8).

## 8. Contenido expuesto por `public/` (bloqueante para staging)

- `public/Logixtic_C4_Arquitectura_Interactiva.html`: documento **de arquitectura interna**. Está en `public/` en el worktree y se sirve públicamente en cualquier build. La documentación de v1 (`docs/productization/02_render_all_in_one.md`) dice que se movió a `docs/productization/archive/`, pero el archivo sigue en `public/`. **Retirarlo** de `public/` antes de staging (decisión del equipo; no movido por esta fase).
- `public/__l5e/assets-v1/…`: imágenes de la tienda de activos de Lovable, incluidos logos de clientes (p. ej. `rr-logistics.png`, `trade-business-sas-hd.png`). Los logos **pendientes de autorización** no deben publicarse en staging sin esa autorización.
- `public/media/img/*.jpg`: fotografías de producto. Revisar licencia.

## 9. Rutas que deben existir en la versión desplegada

- `/` (Home original, sin cambios).
- `/zenox-preview` (preview; noindex; aviso de revisión).
- `/healthz` (desde v1: `src/routes/healthz.ts`; sin ella Render marca el servicio como no saludable).
- Funciones de servidor: `/_serverFn/*` (AgentWidget, `agent.functions.ts`).
- Backend FastAPI en `127.0.0.1:8010` (lo arranca `scripts/start-render.sh`).

## 10. Riesgos de integración

1. El preset de Nitro (sección 5): sin `NITRO_PRESET=node-server` el contenedor no arranca. Bloqueante.
2. `Plans.tsx`: conflicto de 4 bloques con v1 (sección 3). Bajo, resoluble a mano.
3. Backend: el de v1 incluye RAG y Supabase. Para staging deben quedar desactivados (sin URL ni claves; `leads_enabled` falso; llamadas de pago desactivadas). Revisar `ready.py` y `supabase_client.py` antes de desplegar.
4. Estáticos sin control (sección 7) y contenido de `public/` (sección 8). Bloqueante para staging público.
5. Textos EN/PT-BR son borradores.
6. Copy y cifras pendientes de aprobación (ver el documento de staging).

## 11. Protección de producción

- Staging en servicio Render **nuevo**, con su propio nombre y rama, `autoDeploy: off`. No editar el bloque de producción de `render.yaml`.
- Secretos distintos y generados para staging. No reutilizar ninguna clave productiva.
- Sin conexión a base de datos ni a Supabase productivos; sin claves de OpenRouter, Tavily ni Supabase.
- No apuntar dominios personalizados de producción a staging; no enlazar staging desde producción; no incluir en sitemap.
- Antes y después de cada despliegue de staging: comprobar `/` y `/healthz` del servicio productivo.

## 12. Pendientes para la siguiente etapa autorizada

1. Autorizar la creación de la rama de staging desde `12832f9`.
2. Decidir la protección de estáticos (sección 7, opción 1 o 2) y retirar el C4 de `public/`.
3. Añadir `NITRO_PRESET=node-server` al Dockerfile.
4. Integrar `healthz.ts` y resolver `Plans.tsx`.
5. Aprobación comercial de EN/PT-BR, logos, testimonios y cifras.

## 13. Estado tras la fase 3F (rama feat/logixtic-staging-integration)

Las secciones 7, 8 y 12 anteriores quedan **superadas** por lo siguiente, verificado en el contenedor real:

- **Control de acceso de estáticos resuelto (Opción A):** `scripts/staging-gateway.mjs` escucha en `PORT` y reenvía a Nitro (`APP_INTERNAL_PORT`, 10001) solo tras comprobar la credencial. Cubre HTML, JS, CSS, imágenes, vídeos, `robots.txt`, funciones de servidor y `POST`. `/healthz` queda exento.
- **Cierre seguro:** sin `STAGING_BASIC_AUTH` el gateway responde 503 a todo salvo `/healthz`, también dentro de la imagen.
- **Modo `off`:** `scripts/start-render.sh` no levanta el gateway; Nitro escucha en `PORT`, como antes.
- **Preset de Nitro:** `NITRO_PRESET=node-server` en el Dockerfile y comprobación del preset en el build.
- **C4 interno:** ya no está en `public/` en la base `12832f9` (retirado en el commit `62e6370` de v1; copia en `docs/productization/archive/`). No requiere cambios.
- **Vídeos sin licencia:** `public/media/cinematic/**/*.mp4` excluidos del contexto Docker. Verificado: 0 MP4 en la imagen, 404 al pedirlos.
- **Sin mapas de código fuente ni secretos en bundles;** usuario no root en el contenedor.

Pendientes que **no** resuelve el gateway:

1. `public/__l5e/` (logos de clientes, algunos pendientes de permiso) e `public/imagenes feedback/` siguen en el artefacto. Quedan detrás del control, pero la decisión de publicarlos o retirarlos corresponde al equipo comercial.
2. La credencial de staging es compartida; debe rotarse y no reutilizarse en producción.
3. El gateway fija `x-forwarded-proto: https`; en Render es correcto (TLS en el borde), pero no lo validé detrás de un proxy real.
4. No se ha probado el rendimiento con 0,1 vCPU del plan gratuito.
