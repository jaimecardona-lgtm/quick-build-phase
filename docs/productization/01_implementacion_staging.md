# 01 — Implementación de productización (staging) y runbook

> **Nota de supersedencia (Render Free):** la propuesta de dos servicios de este documento queda sustituida por un único contenedor all-in-one. Ver `02_render_all_in_one.md`. El historial de decisiones de este archivo se conserva sin cambios.

Rama: `feat/productizacion-staging` (derivada de `segunda-version` @ `5065439`).
Estado: **código y pruebas locales completados; sin credenciales reales; sin deploy; sin commit.**

## 1. Arquitectura real

```
Visitante (ES/EN/PT-BR)
  └─ TanStack Start SSR (src/lib/agent.functions.ts)
       ├─ askCommercialAssistant → POST /api/v1/ai/chat   (firma HMAC, client_key firmada)
       ├─ getCommercialAssistantStatus → GET /api/v1/ai/health
       └─ calculateRoi → POST /api/v1/roi/calculate
  FastAPI (backend/, servicio separado, sin --reload)
       ├─ /api/v1/health   liveness, sin dependencias externas
       ├─ /api/v1/ready    readiness; consulta Supabase solo si LEADS_ENABLED=true
       ├─ /api/v1/ai/chat  conocimiento aprobado → modelos (primary/fallback) → Judge → respuesta
       ├─ /api/v1/leads    registro con consentimiento; escribe en Supabase con clave secreta
       └─ Supabase REST (apikey = sb_secret_*, nunca Authorization: Bearer)
```

Diferencias respecto a la propuesta original:
- No se creó un proyecto nuevo; se amplió el backend existente.
- El formulario de captura **no existe todavía en la interfaz**. `/api/v1/leads` está listo pero sin
  UI: añadir el formulario con aviso y casilla desmarcada cambia la web visible, y eso requiere
  aprobación del responsable.
- El chat no persiste mensajes (no hay tabla de mensajes en uso). La persistencia de mensajes queda
  desactivada hasta aprobar transcripción, TTL y purga.
- `/planeacion` queda fuera de la compilación pública por bandera de build (no hay autenticación aún).

## 2. Archivos creados o modificados

| Archivo | Tipo | Motivo |
|---|---|---|
| `backend/app/core/config.py` | Modificado | Variables tipadas de roles de modelo, presupuestos, timeouts coherentes, Judge/Engagement apagados, Supabase y captura de leads. Validadores de URL, modelo y timeouts. |
| `backend/app/core/security.py` | Modificado | `ReplayGuard`: rechaza firmas repetidas dentro de la ventana de 300 s. |
| `backend/app/core/gateway.py` | Nuevo | Autorización de pasarela (movida desde `ai.py`) y clave de cuota del cliente firmada. |
| `backend/app/core/logging.py` | Modificado | Lista blanca de métricas técnicas del agente (sin texto ni datos personales). |
| `backend/app/integrations/openrouter_client.py` | Modificado | Presupuesto de tiempo total (`deadline`), `model_override` para Judge/Engagement, tipos de error (`timeout`, `quota`, `network`, `deadline`, `config`), tokens cuando la API los devuelve. |
| `backend/app/integrations/supabase_client.py` | Nuevo | Cliente REST: `apikey`, timeouts 5 s, reintentos solo en 429/5xx, `on_conflict` idempotente, errores sin secretos. |
| `backend/app/services/agent_orchestrator.py` | Modificado | Flujo: política de rastreo → Engagement → conocimiento → modelo → Judge → extractiva si falla. Métricas por respuesta. Presupuesto envuelto en `BudgetedClient`. |
| `backend/app/services/judge_service.py` | Nuevo | Reglas deterministas (cifras, promesas, simulación de embarques) y juez LLM opcional con salida validada por Pydantic. Cierre seguro ante JSON inválido o error. |
| `backend/app/services/engagement_service.py` | Nuevo | Intención (agente de carga vs. persona que busca transporte), CTA sin insistencia. Modelo opcional con mensaje redactado. Nunca crea prospectos. |
| `backend/app/services/text_guard.py` | Nuevo | Redacción de correos y teléfonos; detección de cifras, promesas y accesos simulados no respaldados. |
| `backend/app/services/budget.py` | Nuevo | Presupuesto diario de llamadas y tokens (UTC); cooldown de CTA por sesión. |
| `backend/app/api/v1/ai.py` | Modificado | Runtime por petición, `suggested_action`, `client_key` firmada para cuotas, parseo antes del límite de frecuencia. |
| `backend/app/api/v1/leads.py` | Nuevo | `POST /api/v1/leads`: esquema estricto, `consent_at` del servidor, versión de aviso, deduplicación, errores genéricos. |
| `backend/app/api/v1/ready.py` | Nuevo | `GET /api/v1/ready` sin detalles de conexión. |
| `backend/app/api/v1/__init__.py`, `backend/app/main.py` | Modificados | Registro de rutas y estado de la aplicación. |
| `backend/tests/test_agent_orchestration.py` | Nuevo | 30 pruebas: Judge, Engagement, presupuestos, plazos, fallback, métricas, anti-repetición. |
| `backend/tests/test_leads.py` | Nuevo | 20 pruebas con Supabase simulado: consentimiento, firma, 429, errores sin secreto, readiness. |
| `backend/Dockerfile`, `backend/.dockerignore` | Nuevos | Imagen Python 3.12-slim, usuario no root (uid 10001), healthcheck, sin `.env`, sin `--reload`, sin `--proxy-headers`. |
| `backend/.env.example` | Modificado | Nombres de variables con valores ficticios. Sin secretos. |
| `db/migrations/0002_public_ingress_hardening.sql` | Nuevo | Quita `insert` anónimo/autenticado en `leads`; añade `locale`, `privacy_notice_version`, `dedupe_key`, índices y `purge_expired_ai_data()` solo para `service_role`. |
| `db/tests/0002_ingress_test.sql` | Nuevo | 10 pruebas RLS/privilegios sobre Postgres local efímero. |
| `db/tests/0001_rls_test.sql` | Modificado | Una expectativa actualizada: el anónimo ya no inserta leads (lo exige 0002). |
| `db/tests/run_local_ephemeral.sh` | Nuevo | Levanta Postgres 16 desechable en Docker, aplica 0000/0001/0002 y las pruebas. Contraseña aleatoria, sin persistencia. |
| `src/lib/agent.functions.ts` | Modificado | Fuera de desarrollo, sin `AGENT_API_URL` el agente queda no disponible (no usa localhost). Envía `client_key` derivada de `cf-connecting-ip`. |
| `src/routes/planeacion.tsx` | Modificado | 404 en build público. Módulo interno solo con `VITE_PLANEACION_ENABLED=true`. |
| `src/components/planning/PlanningAppDisabled.tsx` | Nuevo | Stub que sustituye al módulo interno en builds públicos. |
| `vite.config.ts` | Modificado | `define` de la bandera y alias del módulo de planeación. Sin plugins duplicados. |
| `.gitignore` | Modificado | Ignora `.env` y `.env.*` (excepto `*.example`) en la raíz. |
| `docs/productization/00_audit.md` | Existente (sin seguimiento) | Auditoría previa. Conservada. |
| `docs/productization/01_implementacion_staging.md` | Nuevo | Este documento. |

No se tocó: Hero, CSS de escenas, copy, traducciones, CTAs, HubSpot/WhatsApp, Logix, mapas, multimedia.

## 3. Variables de entorno (solo nombres)

Backend (host de FastAPI, nunca `VITE_*`):
`APP_ENV`, `CORS_ALLOW_ORIGINS`, `OPENROUTER_API_KEY`, `OPENROUTER_PRIMARY_MODEL`, `OPENROUTER_FALLBACK_MODEL`,
`OPENROUTER_JUDGE_MODEL`, `OPENROUTER_ENGAGEMENT_MODEL`, `OPENROUTER_TIMEOUT_SECONDS`, `AGENT_TOTAL_TIMEOUT_SECONDS`,
`AGENT_DRY_RUN`, `AGENT_JUDGE_ENABLED`, `AGENT_ENGAGEMENT_ENABLED`, `AGENT_DAILY_MODEL_CALL_BUDGET`,
`AGENT_DAILY_TOKEN_BUDGET`, `AGENT_CTA_COOLDOWN_MINUTES`, `INTERNAL_HMAC_SECRET`, `CHAT_RATE_LIMIT_PER_MINUTE`,
`CHAT_MAX_CHARS`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `LEADS_ENABLED`, `PRIVACY_NOTICE_VERSION`.

Frontend SSR (host de TanStack, solo servidor): `AGENT_API_URL`, `INTERNAL_HMAC_SECRET` (mismo valor que el backend), `NODE_ENV=production`.

Build: `VITE_PLANEACION_ENABLED` (no definir en producción pública).

## 4. Presupuestos y SLO

- Tiempo: `OPENROUTER_TIMEOUT_SECONDS=8` por llamada y `AGENT_TOTAL_TIMEOUT_SECONDS=9` para primary + fallback.
  El SSR espera `CHAT_TIMEOUT_MS=12000`. Así el usuario siempre recibe la respuesta del backend
  (incluida la extractiva) antes de que expire la espera del SSR.
- Llamadas: `AGENT_DAILY_MODEL_CALL_BUDGET=300` y `AGENT_DAILY_TOKEN_BUDGET=150000` por día UTC y por instancia.
  Al agotarse, la respuesta es extractiva (`degradation_reason=budget`).
- Judge y Engagement: apagados (`AGENT_JUDGE_ENABLED=false`, `AGENT_ENGAGEMENT_ENABLED=false`).
- Límite de frecuencia del chat: 10/min por cliente (`client_key` firmada, o IP del socket en desarrollo).
- Límite de registro de leads: 5/min por cliente.

## 5. Procedimiento de staging (cuando existan credenciales)

1. Crear el proyecto Supabase de staging (organización autorizada). Anotar la URL y generar una clave `sb_secret_*`.
2. En una base **de staging**, aplicar `db/migrations/0001_roles_cms_leads_audit.sql` (una sola vez) y registrar fecha y SHA.
3. Aplicar `db/migrations/0002_public_ingress_hardening.sql` después de 0001.
4. Crear el primer administrador con Supabase Auth real y asignar rol con operación auditada. No insertar en `auth.users` a mano.
5. Probar RLS con `db/tests/0002_ingress_test.sql` **solo** en Postgres local efímero (`bash db/tests/run_local_ephemeral.sh`). No ejecutar en la nube compartida.
6. Construir la imagen: `docker build -t logixtic-api backend`.
7. Ejecutar con secretos del host: `docker run -p 8000:8000 --env-file <archivo-fuera-del-repo> logixtic-api`.
8. Verificar: `GET /api/v1/health` = 200; `GET /api/v1/ai/health` con `dry_run=false` y `model_configured=true`;
   `GET /api/v1/ready` = 200.
9. Configurar el SSR con `AGENT_API_URL=https://<api-staging>` y el mismo `INTERNAL_HMAC_SECRET`.
10. Probar el chat desde otro equipo. Confirmar que las respuestas citan fuentes aprobadas.
11. Probar un lead con correo de prueba y consentimiento. Consultar la fila y borrarla.
12. Activar `AGENT_JUDGE_ENABLED` y `AGENT_ENGAGEMENT_ENABLED` solo tras validar en staging.

Mantenimiento: purga de sesiones con `select public.purge_expired_ai_data();` (rol `service_role`) en un job del propietario.

## 6. Resultados verificados (esta sesión)

| Comprobación | Resultado |
|---|---|
| `bun run verify:content` (equivalente `npm run verify:content`) | OK: 1284 cadenas, 49 bloques |
| `tsc --noEmit` | OK |
| `vite build` (bandera apagada) | OK. Módulo interno de planeación ausente del bundle público |
| `vite build` (bandera encendida) | OK |
| `/planeacion` en dev, sin bandera | HTTP 404 |
| Pytest backend | **98 passed** (48 previas + 30 orquestación + 20 leads) |
| Ruff backend | All checks passed |
| Ruff format backend | 42 archivos formateados |
| Postgres 16 efímero: 0001 + 0002 + pruebas 0002 | 10/10 OK |
| Postgres 16 efímero: pruebas originales 0001 (adaptadas) | 19/19 OK |
| Imagen Docker backend | Construida. Contenedor `healthy`, usuario uid 10001 |
| Contenedor: health / ai-health / ready / leads sin firma (dev) | 200 / 200 / 200 / 503 |
| ESLint en archivos tocados | 170 errores, todos `prettier/prettier` por finales de línea CRLF heredados del repo. Con esa regla desactivada: 0 errores |
| `git diff --check` | Sin errores de espacios. Avisos de CRLF por `core.autocrlf` |

No verificado en esta sesión:
- Capturas del Hero a 1440/1920/390/768 tras esta fase. No hubo cambios visuales, pero no se volvieron a capturar.
- Llamadas reales a OpenRouter o Supabase: no hay credenciales. Todo se probó con transportes simulados.
- Que los IDs de modelo existan y sean gratuitos en OpenRouter: no se comprobó contra la API.
- La migración 0002 sobre el Postgres real de Supabase (solo local efímero).

## 7. Pendientes y riesgos

Bloqueantes para staging (requieren al propietario):
1. Proyecto Supabase de staging y claves nuevas (`sb_secret_*`).
2. Clave OpenRouter y confirmación de los IDs de modelo y de su coste (`:free`, sin cargos).
3. Dominio/hosting para la API y el SSR, y aprobación de costes. Cloudflare debe tener el proxy activo para que `cf-connecting-ip` sea fiable.
4. Versión real del aviso de privacidad (ahora `pendiente-aprobacion`).
5. Decisión sobre el formulario de captura en la interfaz (aviso visible y casilla desmarcada).

Técnicos pendientes:
- Los límites de frecuencia, la anti-repetición y el presupuesto son **por instancia (memoria)**. Con varias réplicas hace falta un almacén compartido.
- No hay Turnstile ni WAF; la protección anti-bots depende de Cloudflare.
- Cabeceras de seguridad (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`) aún no están configuradas en el hosting.
- `public/Logixtic_C4_Arquitectura_Interactiva.html` es un documento de arquitectura interno y **se sirve públicamente**. Recomiendo retirarlo de `public/`; no lo he movido sin tu decisión.
- `/planeacion`: la bandera solo impide compilarla en público. Sigue sin autenticación real. El título de la ruta y los estilos globales `.pl-*` de `src/styles.css` siguen en el bundle público.
- Judge y Engagement con modelo: solo probados con mocks.
- Las respuestas del modelo se validan contra las fuentes aprobadas con reglas deterministas. Una respuesta que el juez no verifica se reemplaza por la extractiva.
- Piloto de 10–20 preguntas por idioma (ES/EN/PT-BR) y pruebas de entradas maliciosas: pendientes con el servicio real.
- Retención de logs y de datos de prospectos: documentar tras aprobar la política.
- Lint: los 170 errores de CRLF son heredados del repositorio. Conviene normalizar finales de línea en un commit aparte.

Sin deploy, sin commit, sin push, sin merge. Rama de trabajo creada: `feat/productizacion-staging`.
