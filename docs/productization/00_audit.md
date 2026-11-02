# 00 — Auditoría Bloque 0 (2026-11-01)

Estado de auditoría de solo lectura. No se han modificado archivos de producto, no hay commits, push, merge, reset ni clean.

## 1. Rama y estado Git

- Rama actual: `segunda-version` (sigue a `origin/segunda-version`, sin divergencia).
- HEAD: `5065439 version visual final`. Incluye el Hero `digitalizacion.jpg` bajo `aplicacion web.jpg`, el CSS del hero y el registro en `docs/motion-forwarders-v2/DECISIONES.md`.
- Árbol de trabajo: limpio (`git status` sin cambios). `git diff --check` sin salida.
- Nota: el estado al inicio de la sesión mostraba cambios sin commit; ya están en `5065439`, no los he tocado.
- Rama nueva para el trabajo de productización: **no creada**, requiere permiso expreso (restricción 1).

## 2. Verificaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| `bun run verify:content` (usa `npm run`, equivalente) | OK: 1284 cadenas coinciden con el baseline (49 bloques) |
| `tsc --noEmit` | OK |
| `vite build` | OK (exit 0) |
| `eslint .` | Pendiente: ejecución larga, no completada en esta pasada |
| `backend/.venv` pytest (`python -m pytest -q`) | 48 passed, 1 warning (deprecación `httpx` en TestClient) |
| `ruff check` (backend) | All checks passed |

## 3. Archivos referenciados en el encargo que NO existen en el repo

| Referencia del encargo | Estado |
|---|---|
| `db/migrations/0001_roles_cms_leads_audit.sql` | Existe |
| `db/tests/0001_rls_test.sql`, `db/tests/0000_auth_shim_for_tests.sql` | Existen (no ejecutar contra nube) |
| `db/migrations/0002_public_ingress_hardening.sql` ("adjunto") | **No existe** |
| `backend/Dockerfile` ("adjunto") | **No existe** |
| `docs/security-backlog.md` | Existe |

## 4. Hallazgos verificados en código

| Hallazgo | Verificación | Archivo:línea |
|---|---|---|
| Inserción anónima directa en leads | Confirmado: `create policy leads_public_insert ... to anon, authenticated` | `db/migrations/0001_roles_cms_leads_audit.sql:271` |
| Dry-run por defecto | Confirmado: `agent_dry_run: bool = True`. La IA devuelve texto simulado mientras no se configure `AGENT_DRY_RUN=false` | `backend/app/core/config.py:47`, `backend/app/integrations/openrouter_client.py:3,16` |
| Timeouts incoherentes | Confirmado: frontend 12 s (`CHAT_TIMEOUT_MS`), backend OpenRouter 30 s (`openrouter_timeout_seconds=30.0`) | `src/lib/agent.functions.ts:10`, `backend/app/core/config.py:45` |
| URL local por defecto en SSR | Confirmado: `http://127.0.0.1:8010` | `src/lib/agent.functions.ts:11` |
| HMAC sin nonce, tolerancia 300 s | Confirmado | `backend/app/core/security.py:16` |
| Rate limit por IP del socket | Confirmado: `request.client.host`; si todo el tráfico sale del SSR, la IP es compartida | `backend/app/api/v1/ai.py:66`, `RateLimiter` en `backend/app/core/security.py:44` |
| CORS solo GET | Confirmado | `backend/app/main.py:34` |
| `/planeacion` sin guard | Confirmado: ruta pública con `robots: noindex` (no es seguridad). El componente `PlanningApp` no se ha auditado en esta pasada | `src/routes/planeacion.tsx:13` |
| Persistencia en `localStorage` de planeación | Confirmado en `src/lib/planning/store.tsx` (y en `src/lib/i18n.tsx`, para preferencias) | `src/lib/planning/store.tsx` |
| Plugins Vite duplicados | No hay duplicados: `vite.config.ts` delega en `@lovable.dev/vite-tanstack-config` y advierte no añadir plugins | `vite.config.ts` |

## 5. Riesgos abiertos antes de cualquier despliegue

1. **Agente no funcional sin configuración**: con los valores por defecto el chat responde texto simulado. Antes de vender "IA real" hay que activar `AGENT_DRY_RUN=false` con clave y modelo autorizados en el host, no en el repo.
2. **Lead anónimo directo a Postgres**: la política actual permite insertar leads desde `anon`. Hay que cerrarla (requiere el 0002 que no existe).
3. **Límite de peticiones compartido**: con un frontend intermedio, todos los usuarios comparten IP.
4. **Antirreplay débil**: HMAC sin nonce.
5. **`/planeacion` pública**: contenido interno accesible sin login.
6. **Archivos adjuntos ausentes**: 0002 y Dockerfile no están en el repo; no pueden aplicarse ni verificarse.
7. **Lint no completado**: queda pendiente de registrar errores legados.

## 6. Cosas que requieren decisión o credenciales del usuario

- Permiso para crear la rama de trabajo derivada de `segunda-version`.
- Proyecto Supabase nuevo y sus claves (`sb_publishable_*`, `sb_secret_*`), que deben introducirse solo como secretos del host.
- Clave de OpenRouter, modelo principal y de fallback autorizados, y presupuesto aprobado.
- Proveedor de hosting elegido y aprobación de costos.
- Entrega de `0002_public_ingress_hardening.sql` y `backend/Dockerfile`, o autorización para redactarlos.

## 7. Plan propuesto

Los bloques 2 y 3 pueden avanzar con mocks (`httpx.MockTransport`) cuando haya permiso de rama. Los bloques 1 y 5 requieren credenciales y hosting reales. El bloque 4 (`/planeacion`, cabeceras, logs) se puede ejecutar en código con permiso.
