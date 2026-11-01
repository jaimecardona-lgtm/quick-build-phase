# Logixtic V7 · Auditoría local y entrega del corte de backend, base de datos y agente

Fecha: 2026-10-31. Rama: `primera-version`. Commits sobre `main`: **0**. No se hizo commit, push, merge, despliegue ni reset.

Estado en una frase: el backend del agente y la migración de base de datos están **implementados y verificados** en sus propios entornos. La conexión con Lovable Cloud, la pasarela Edge Function, el widget público y el CMS **no están implementados**: no hay acceso a Lovable Cloud desde este entorno.

## 1. Estado de Git (verificado)

- Rama: `primera-version`. `main` y `origin/primera-version` apuntan a `f4b1d03`.
- `git rev-list --count main..primera-version` = 0.
- `git status --short` lista ~26 entradas modificadas o sin seguir, más 117 archivos sin seguir (incluye `public/__l5e/`, `public/media/`, `backend/`, `docs/`, `db/`, `scripts/`, `src/components/experience/`).
- El remoto no contiene nada de V4–V7: todo el trabajo de las rondas anteriores existe solo en este equipo.

## 2. Inventario de cambios locales (qué hay y por qué)

| Área | Archivos | Motivo | Estado |
| --- | --- | --- | --- |
| Hero | `src/components/experience/CinematicHero.tsx`, `cinematic.css` | Hero con vídeo `barco` + `escaneo`, sin tablet | Activo solo con flag |
| Fondos | `CinematicBackgroundSequence.tsx`, `scene-backgrounds.css`, `scene-ambient.css` | Fondos secuenciales y atmósfera | Activo solo con flag |
| Flow | `Flow.tsx`, `DigitalTraceOverlay.tsx`, `digital-trace.css`, `trace-labels.ts` | Tres actos (escaneo → banda DEMO → captura real) | Activo solo con flag |
| Testimonio | `SuccessStories.tsx`, `TestimonialStage.tsx`, `testimonial-*.{ts,css}` | Reproductor inline YouTube con silencio y visibilidad | Siempre activo (cambia el contenedor, no el ID ni el texto) |
| Otras secciones | `Problem.tsx`, `Implementation.tsx` (solo inserción), `Evidence.tsx` (mapa intacto + globo), `LogixAI.tsx` (import CSS), `ClientsReel`, `Plans`, `Faq`, `Closing` | Fondos y atmósfera | Atmósfera solo con flag |
| Medios | `public/media/cinematic/*` (8 masters + 8 derivados 720p + 8 posters) | Vídeo local | Sin seguir |
| Medios legales | `public/media/cinematic/license-manifest.json` | Inventario de licencias: **pendiente de revisión** | Sin seguir |
| Assets Lovable | `public/__l5e/` (36 binarios) | Restaurados desde la app publicada, verificados por tamaño | Sin seguir |
| Routing | `src/routes/index.tsx` | Flag `VITE_LOGIXTIC_MOTION_V2` | Modificado |
| Backend | `backend/app/**`, `backend/tests/**` | Agente, ROI, seguridad, conocimiento | Ver sección 3 |
| Base de datos | `db/migrations/0001_*.sql`, `db/tests/*.sql` | Esquema, RLS y pruebas | Ver sección 4 |

**Flag:** en desarrollo (`.env.development`) `VITE_LOGIXTIC_MOTION_V2=true`. En build de producción el valor efectivo es `false` (sin archivo de producción). Sin flag, el hero es el original `Hero.tsx`, no hay fondos secuenciales ni banda de Flow.

## 3. Backend FastAPI (implementado y verificado)

Archivos nuevos o modificados: `app/api/v1/ai.py`, `app/api/v1/roi.py`, `app/api/v1/__init__.py`, `app/core/security.py` (HMAC + limitador), `app/core/ratelimit_types.py`, `app/core/config.py` (campos nuevos), `app/integrations/openrouter_client.py` (respaldo entre modelos), `app/services/knowledge_service.py`, `app/services/roi_service.py`, `app/services/agent_orchestrator.py`, `app/tools/registry.py`, `app/knowledge/approved_public_es.json` (24 entradas generadas desde `src/lib/content.ts`), `app/main.py` (cableado de estado), `tests/test_agent.py`, `tests/test_roi.py`, `.env.example`.

| Ruta | Función | Seguridad |
| --- | --- | --- |
| `GET /api/v1/health`, `GET /api/v1/config/public` | Existentes | Públicas, sin secretos |
| `POST /api/v1/ai/chat` | Agente comercial público, solo contenido aprobado | Firma HMAC si `INTERNAL_HMAC_SECRET` está configurado; sin secreto solo en `development`/`test`; límite por IP; mensaje máx. `CHAT_MAX_CHARS` |
| `GET /api/v1/ai/health` | Estado sin secretos (`dry_run`, versión de conocimiento, `signature_required`) | Pública, no expone claves |
| `POST /api/v1/ai/tools/{name}` | Herramientas en lista blanca: `search_public_content`, `calculate_roi`, `request_demo` (con consentimiento) | Firma HMAC; nombre fuera de lista → 404 |
| `POST /api/v1/roi/calculate` | ROI determinista con `Decimal`, supuestos explícitos, sin LLM | Pública, validada (rangos) |

Comportamiento del agente (verificado con pruebas y con peticiones HTTP reales):
- Rastreo real (GPS, ETA, «mi carga»…) → rechazo sin llamar al modelo (`refused: true`).
- Sin fuente aprobada → «No encuentro esa información…», sin inventar (`sources: []`).
- Con fuente → respuesta con `sources` (IDs de la base aprobada). Con clave y modelo, se llama a OpenRouter con el contexto aprobado; el mensaje del visitante va delimitado como dato.
- Error o modelo caído → texto aprobado extractivo, `degraded: true`.
- Modelos en orden (`OPENROUTER_PRIMARY_MODEL`, luego `OPENROUTER_FALLBACK_MODEL`); reintenta solo con 429, 5xx, timeout o error de red.

Comandos verificados (Windows PowerShell, desde `backend/`):

```powershell
.\.venv\Scripts\python.exe -m pytest -q          # 44 passed (sin red, sin clave)
.\.venv\Scripts\python.exe -m ruff check .       # All checks passed
.\.venv\Scripts\python.exe -m ruff format --check .   # 32 files already formatted
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8765
```

Smoke test real (servidor arrancado, dry-run, sin clave): `/api/v1/health` 200; `/api/v1/ai/health` 200 con 24 entradas; chat sobre FAQ → respuesta con fuentes `faq-01, faq-07, faq-14`; rastreo real → rechazo; ROI 100 × 2 h × 20 € × 25 % − 300 € = 1000,00 / 700,00; ningún log contiene `sk-`.

Limitaciones honestas:
- **No se ha llamado a OpenRouter real.** No hay clave en el entorno; las pruebas usan transporte simulado. La integración real queda `PENDIENTE` hasta tener clave y modelos aprobados.
- La recuperación es por términos normalizados, **no RAG vectorial**.
- El límite de frecuencia es en memoria: con varias instancias no se comparte.
- `app/knowledge/approved_public_es.json` es una copia generada del contenido aprobado; si cambia `content.ts`, hay que regenerarla y versionarla.

## 4. Base de datos y roles (migración escrita y verificada en PostgreSQL 16, NO aplicada a Lovable Cloud)

`db/migrations/0001_roles_cms_leads_audit.sql`: 13 tablas (`profiles`, `role_assignments`, `site_sections`, `site_section_versions`, `blog_posts`, `blog_translations`, `media_assets`, `leads`, `roi_scenarios`, `ai_sessions`, `ai_messages`, `knowledge_sources`, `audit_logs`), función `has_role()` basada en `auth.uid()`, 24 políticas RLS, trigger de auditoría de versiones y revokes explícitos para `anon`.

Verificación: contenedor desechable `postgres:16-alpine` (Docker), con un shim de identidad **solo de prueba** (`db/tests/0000_auth_shim_for_tests.sql`). `db/tests/0001_rls_test.sql` ejecuta 22 aserciones cambiando de rol (`anon`, editor, publicador, comercial, administrador, usuario sin roles):

- anónimo: no crea versiones, no lee leads, no ve borradores, no ve auditoría, no accede a ROI ni a mensajes de IA; sí inserta leads con consentimiento y ve versiones publicadas.
- editor: crea borradores propios, **no publica**, no se autoasigna admin, no crea a nombre de otro autor, no ve auditoría.
- publicador: publica con aprobador propio, no puede poner otro aprobador.
- comercial: solo ve sus leads asignados.
- administrador: ve la auditoría.
- Control negativo: una aserción falsa detiene el script con código 3 (el arnés sí falla).

Resultado: `TODAS LAS PRUEBAS RLS PASARON` (exit 0).

**Lo que falta antes de aplicar en Lovable Cloud:** confirmar que el proyecto tiene Auth y PostgreSQL activados y que el esquema de identidad coincide con `auth.users` / `auth.uid()`. No se ha ejecutado nada contra Cloud.

## 5. Lo que NO está implementado (BLOQUEADO o PENDIENTE)

| Elemento | Estado | Motivo |
| --- | --- | --- |
| Conexión a Lovable Cloud (provisión, Auth, aplicación de migraciones) | **BLOQUEADO** | Sin acceso autorizado desde el entorno; la documentación indica que Cloud no expone SQL externo |
| Edge Function (pasarela firmada) | **PENDIENTE** | Depende de Cloud. El backend ya verifica la firma HMAC que enviará |
| Widget público `LogixWebAssistant` en la web | **PENDIENTE** | No empezado. Requiere la pasarela |
| Protección de `/planeacion` y ruta `/admin` | **PENDIENTE** | Requiere Auth de Cloud. Sin guard en servidor hoy |
| CMS editable y bloque piloto con borrador → publicar | **PENDIENTE** | Requiere DB y Auth |
| Blog local | **PENDIENTE** | Hoy el blog es un enlace externo; se mantiene |
| ROI interactivo en la web | **PENDIENTE** | Hoy el ROI es un enlace externo; se mantiene |
| Llamada real a OpenRouter | **PENDIENTE** | Sin clave y modelos aprobados |
| Migración de `/planeacion` (localStorage) | **PENDIENTE** | Antes exportar datos del navegador; no migrar automáticamente |
| Prueba E2E de navegador del agente | **PENDIENTE** | Depende del widget |
| Escena Flow final con evidencia de estados A/B/C grabada | **PARCIAL** | Verificada en prueba automática; sin grabación final de la sesión |
| Vídeo del testimonio con sonido real en YouTube | **NO VERIFICADO** | El entorno no tiene acceso confiable a YouTube |
| Licencias de vídeo, marcas visibles y releases | **PENDIENTE** | Ver `license-manifest.json`; avión (Cargolux, Delta) y navieras |
| Masters de vídeo dentro de `public/` (58 MB y 84 MB) | **PENDIENTE** | Mover fuera del bundle antes de desplegar |

## 6. Riesgos (estado tras esta ronda)

| ID | Prioridad | Riesgo | Estado |
| --- | --- | --- | --- |
| R01 | P0 | Estado local distinto del remoto | Inventariado en la sección 1–2; sin publicar |
| R02 | P0 | `/planeacion` sin autenticación | **Abierto** (requiere Cloud Auth) |
| R03 | P0 | Sin persistencia CMS en el código remoto | Migración y RLS verificadas; **no aplicada** |
| R04 | P0 | Sin agente IA real | Backend con modelo y fallback; **sin llamada real verificada** |
| R05 | P1 | Contenido repartido | Sin cambios de fuente de verdad |
| R06 | P1 | README/AGENTS desactualizados | **Abierto**; no tocado hasta auditoría completa |
| R07 | P1 | Vídeo que queda en poster | Verificado por muestreo de `readyState`/opacidad; corregido un bug de re-render |
| R08 | P1 | CSS global que rompe capas | Corregido el `position` forzado de la banda de datos |
| R09 | P1 | Masters grandes en `public/` | **Abierto** |
| R10 | P1 | Baseline de copy regenerado | Regenerado **dos veces** (1291→1288→1284) solo por literales de código eliminados; ninguna cadena visible cambió. Pendiente de revisión humana |
| R11 | P1 | Sin suite de tests formal en frontend | Backend: 44 pruebas + 22 aserciones SQL. Frontend: sin suite automatizada en `package.json` (solo scripts ad hoc de Playwright) |
| R12 | P1 | Visuales sin valor de software | Flow con relato A/B/C; el resto pendiente |

## 7. Comandos de ejecución

Frontend (Windows PowerShell, desde la raíz):

```powershell
bun install --frozen-lockfile
bun run dev          # con .env.development: VITE_LOGIXTIC_MOTION_V2=true
bun run build
bun run verify:content
```

Backend:

```powershell
cd backend
py -3.12 -m venv .venv            # ya creado en este equipo
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pytest -q
ruff check .
```

Variables (solo nombres; los valores van en `.env` local, nunca en el repositorio): `APP_ENV`, `CORS_ALLOW_ORIGINS`, `OPENROUTER_API_KEY`, `OPENROUTER_PRIMARY_MODEL`, `OPENROUTER_FALLBACK_MODEL`, `OPENROUTER_TEMPERATURE`, `OPENROUTER_MAX_TOKENS`, `OPENROUTER_TIMEOUT_SECONDS`, `AGENT_DRY_RUN`, `INTERNAL_HMAC_SECRET`, `CHAT_RATE_LIMIT_PER_MINUTE`, `CHAT_MAX_CHARS`.

Base de datos (solo entorno de prueba desechable):

```powershell
docker run -d --name logixtic-pg-test -e POSTGRES_PASSWORD=<valor-solo-de-prueba> postgres:16-alpine
# aplicar en orden: shim de prueba, migración, pruebas RLS
Get-Content db\tests\0000_auth_shim_for_tests.sql | docker exec -i logixtic-pg-test psql -U postgres -v ON_ERROR_STOP=1
Get-Content db\migrations\0001_roles_cms_leads_audit.sql | docker exec -i logixtic-pg-test psql -U postgres -v ON_ERROR_STOP=1
Get-Content db\tests\0001_rls_test.sql | docker exec -i logixtic-pg-test psql -U postgres -v ON_ERROR_STOP=1
docker rm -f logixtic-pg-test
```

## 8. Siguiente paso recomendado (sin deploy ni merge)

1. Confirmar si Lovable Cloud está activado en el proyecto y si el esquema de identidad coincide con la migración.
2. Proteger `/planeacion` en servidor y exportar primero los datos de su `localStorage`.
3. Crear la pasarela (Edge Function) que firma con `INTERNAL_HMAC_SECRET` y llama al backend.
4. Obtener clave y modelos aprobados de OpenRouter para una prueba real.
5. Revisar licencias de los vídeos antes de cualquier publicación.
