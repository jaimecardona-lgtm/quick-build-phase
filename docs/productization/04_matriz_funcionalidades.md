# 04 — Matriz de funcionalidades de la web frente a Supabase

Auditoría de código (`src/`, `backend/`, `db/`). Fecha: 2026-11-02. Rama `feat/productizacion-staging`.
Estado de Supabase: **sin acceso desde esta sesión** (ver `03_supabase_rag.md` §1). Nada de lo marcado
como "Supabase" está verificado en el proyecto remoto.

## Matriz

| Funcionalidad | Estado real | Dónde vive | Supabase | Falta |
|---|---|---|---|---|
| Landing, Hero, secciones, copy ES/EN/PT-BR | Completa, **estática** | `src/lib/content.ts`, componentes `src/components/site/*` | No se usa | Nada para la landing actual |
| CMS de secciones | **No existe** | Solo tablas `site_sections` y `site_section_versions` (0001) | Sin lectura ni escritura desde la web | UI de edición y lectura desde la web, si se necesita |
| Blog | **No existe** | Sin ruta (`src/routes/` solo tiene index, planeacion y healthz). Tablas `blog_posts` y `blog_translations` en 0001 | No se usa | Ruta y contenido, si se necesita |
| Prospectos (formulario) | **Backend listo, sin UI** | `POST /api/v1/leads` (FastAPI), desactivado con `LEADS_ENABLED=false` | No se usa. Tabla `leads` existe, sin inserciones desde la web | Formulario con aviso de privacidad y casilla desmarcada, y aprobación del responsable |
| CTA de demo y WhatsApp | Completa, **externa** | `src/lib/logixtic.ts` (HubSpot), `src/lib/whatsapp.ts` (wa.me) | No se usa. Los clics no llegan a la base | Nada técnico; un prospecto por HubSpot o WhatsApp no pasa por Supabase |
| ROI (calculadora) | **Conectada** | Widget (`AgentWidget.tsx`) → server function `calculateRoi` → FastAPI `/api/v1/roi/calculate` (determinista) | No se usa | Nada; el resultado no se guarda |
| Analítica | **Solo en cliente** | `track()` en `src/lib/analytics.ts` escribe en `window.dataLayer`; no hay script de destino en `index.html` | No se usa | Un destino real (p. ej. GTM o un endpoint propio). Hoy los eventos no se registran en ningún sitio |
| Chat Logix Web (agente comercial) | **Conectado** | Widget → server functions → FastAPI → OpenRouter (y RAG si `RAG_ENABLED=true`) | No se persiste nada en Supabase | Ver "Sesiones del agente" |
| Recuperación RAG (conocimiento) | **Construida y probada en local**; remota **pendiente** | Migración 0003, `rag_retriever.py`, ingesta `knowledge_ingest.py` | Pendiente de aplicar | Aplicar migraciones, cargar y aprobar en el proyecto real |
| Sesiones del agente (historial) | **No persisten** | Estado solo en memoria del widget | Tablas `ai_sessions` y `ai_messages` (0001) sin uso | Solo si se aprueban transcripción, TTL y purga. Hasta entonces, no crear ni escribir |
| LogixAI (demostración animada) | **Estática / ilustrativa** | `src/components/site/LogixAI.tsx`, casos ficticios por estados de React | No se usa | Nada; no debe presentarse como consulta real |
| Planeación interna (`/planeacion`) | **Oculta en público** | Ruta con `noindex` y 404 por bandera de build; datos en `localStorage` | No se usa | Autenticación y autorización reales antes de exponerla |
| Health checks | Completa | `/healthz` (SSR), `/api/v1/health`, `/api/v1/ready` | Solo `ready` consulta Supabase, y solo con `LEADS_ENABLED=true` | Nada |

## Tablas de la base de datos frente a la web

| Tabla | Migración | Uso en la web hoy | Comentario |
|---|---|---|---|
| `profiles`, `role_assignments` | 0001 | Ninguno | Necesarias para RLS y roles de staff |
| `site_sections`, `site_section_versions` | 0001 | Ninguno | CMS sin implementar |
| `blog_posts`, `blog_translations`, `media_assets` | 0001 | Ninguno | Blog sin implementar |
| `leads` | 0001 + 0002 | Ninguno | Endpoint listo; desactivado |
| `roi_scenarios` | 0001 | Ninguno | El ROI no guarda escenarios |
| `ai_sessions`, `ai_messages` | 0001 | Ninguno | Sin persistir por política |
| `knowledge_sources` | 0001 | Lectura por RAG (con `published_version`) | Activa solo si `RAG_ENABLED=true` |
| `knowledge_chunks`, `knowledge_ingestion_runs` | 0003 | Lectura por RAG (`service_role`) | Pendiente remoto |
| `audit_logs` | 0001 | Lo escribe un trigger de versiones de `site_section_versions` | Sin uso mientras no haya CMS |

**Propuesta de tablas:** ninguna nueva. Cada una de las existentes responde a una funcionalidad planificada.
Lo que falta son las funcionalidades (formulario, CMS, blog), no tablas.

## Lo que sí está completo y verificado

- Landing estática con copy aprobado (`verify:content`: 1284 cadenas).
- Agente Logix Web: FastAPI + OpenRouter real verificado (una petición), fallback local verificado.
- RAG: recuperación híbrida verificada en local con embeddings reales (sección 6 de `03`).
- ROI: flujo de widget → server function → FastAPI (el cálculo es determinista, pruebas en `test_roi.py`).
- Seguridad de entrada: HMAC entre SSR y FastAPI, anti-repetición, límite de frecuencia, leads desactivados.

## Lo que falta para "web conectada a Supabase"

1. Desbloquear la CLI y aplicar 0001 a 0003 en el proyecto `wjccxmpxhhavfmhgnqft`.
2. Cargar y aprobar los 54 documentos (ingesta con `--publish --approved-by <uuid>`).
3. Probar la RPC `match_knowledge_hybrid` a través del gateway real de Supabase.
4. Decidir si el formulario de prospectos se implementa (requiere aviso aprobado y casilla de consentimiento).
5. Decidir si la analítica se conecta a un destino y cuál.
6. Decidir si el CMS y el blog entran en esta fase. Hoy no son necesarios para la landing.
