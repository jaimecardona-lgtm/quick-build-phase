# 05 — Auditoría del proyecto Supabase real (`wjccxmpxhhavfmhgnqft`, "logixtic")

Fecha: 2026-11-02. Método: volcado de **solo esquema** con `supabase db dump --linked --schema public`
(lectura, sin datos) y `supabase migration list --linked`. No se escribió nada en remoto en esta fase.

## 1. Vinculación y migraciones

| Comprobación | Resultado |
|---|---|
| Proyecto vinculado (`supabase/.temp/project-ref`) | `wjccxmpxhhavfmhgnqft` (marcado ● en `projects list`) |
| Región | East US (North Virginia) |
| Historial local = remoto | `20261101000100`, `20261101000200`, `20261102000300`: aplicadas y casan |

## 2. Esquema `public` (volcado)

| Elemento | Resultado |
|---|---|
| Tablas | **15** (`ai_messages`, `ai_sessions`, `audit_logs`, `blog_posts`, `blog_translations`, `knowledge_chunks`, `knowledge_ingestion_runs`, `knowledge_sources`, `leads`, `media_assets`, `profiles`, `roi_scenarios`, `role_assignments`, `site_section_versions`, `site_sections`) |
| RLS habilitada | **15 de 15** |
| Funciones | `audit_section_version`, `has_role`, `match_knowledge_hybrid`, `purge_expired_ai_data` |
| `knowledge_chunks.embedding` | `extensions.halfvec(2048)`, `NOT NULL` |
| Índice vectorial | `knowledge_chunks_embedding_hnsw_idx`: HNSW `halfvec_cosine_ops` |
| Índice textual | `knowledge_chunks_tsv_idx`: GIN sobre `tsv` |
| `match_knowledge_hybrid` | `REVOKE ALL … FROM PUBLIC`; `GRANT ALL … TO service_role`. **Ningún GRANT explícito a `anon` ni a `authenticated`** |
| `knowledge_chunks` | `GRANT ALL` a `authenticated` y `service_role`; sin GRANT a `anon`. RLS: solo política de lectura para staff |
| `knowledge_ingestion_runs` | `GRANT ALL` a `authenticated`; RLS: solo lectura para admin |

## 3. Riesgos y mejoras detectadas

1. **Privilegios de tabla amplios para `authenticated`** (`GRANT ALL` en `knowledge_chunks` y
   `knowledge_ingestion_runs`). Mitigado por RLS (no hay políticas de escritura para esos roles), pero el
   privilegio está concedido. **Propuesta opcional, no aplicada:** migración `0004` con
   `revoke insert, update, delete on knowledge_chunks, knowledge_ingestion_runs from authenticated;`.
   Requiere aprobación.
2. **Defaults de Supabase** (`ALTER DEFAULT PRIVILEGES … GRANT ALL ON FUNCTIONS/TABLES TO anon, authenticated`):
   no afectan a las funciones de RAG (sin grant explícito), pero cualquier objeto nuevo que se cree en `public`
   recibirá esos privilegios. Hay que revisar cada migración nueva con `REVOKE` explícito.
3. **Verificación directa pendiente:** que `anon` reciba error 401/403 al llamar a la RPC por PostgREST real.
   Requiere la clave publicable y la clave de servidor (ver §5).

Comprobación local con las mismas ACL por defecto de Supabase (Postgres efímero):
`anon` sin `EXECUTE` sobre la RPC; `authenticated` sin `EXECUTE`; `service_role` con `EXECUTE`;
`anon` sin `SELECT` en `knowledge_chunks`.

## 4. Conteos y datos

No se pudieron contar registros: sin clave de servidor no hay acceso de lectura por API. Pendiente: contar
`knowledge_sources`, `knowledge_chunks`, `knowledge_ingestion_runs`, `leads` y `profiles` (esperado: 0 en
`leads` y `profiles`, según el estado de la fase).

## 5. Bloqueo para la carga de datos

La carga de fuentes y fragmentos y las búsquedas reales necesitan la clave `sb_secret_*` en el entorno del
proceso (no en el repositorio). La CLI 2.48 no ejecuta SQL arbitrario. Opciones:

- (Recomendada) En tu terminal: `supabase projects api-keys --project-ref wjccxmpxhhavfmhgnqft`, copiar la
  clave de tipo `secret` en `.env.supabase.local` (ignorado por Git, variable `SUPABASE_SECRET_KEY`). No la pegues
  en el chat.
- Alternativa: aprobar una migración de datos `seed` con la ingesta. Desaconsejada: deja contenido en el
  historial de migraciones.

Nota: en `.env.supabase.local` hay actualmente una clave **de tipo `service_role` heredada** que escribí por error.
Debe reemplazarse por la `sb_secret_*` o eliminarse.

## 6. Ingesta remota (resultado, 2026-11-02)

Escritura vía PostgREST con la clave de servidor (`apikey`), sin publicar.

| Medida | Resultado |
|---|---|
| Fuentes en `knowledge_sources` | **54** (es 24, en 15, pt-BR 15) |
| Fuentes aprobadas | **0** (correcto: no hay publicación) |
| Fragmentos en `knowledge_chunks` | **54**, `embedding_dim = 2048` |
| Primera ingesta | 54 fuentes, 54 fragmentos escritos |
| Segunda ingesta (idempotencia) | 0 escritos, **54 omitidos** por hash; sin duplicados |
| Ejecuciones en `knowledge_ingestion_runs` | 2 (una por ingesta que escribió) |
| Embeddings | Reutilizados de la caché verificada (54 de 54); **0 llamadas nuevas** al modelo |

## 7. Publicación: detenida (sin aprobador)

`GET /auth/v1/admin/users` devuelve **0 usuarios**. Según la regla de la fase, no se publica con un UUID
ficticio. Para habilitarla:

1. Crear un usuario real en Supabase: Dashboard → Authentication → Users → *Add user* (o registro normal).
2. Asignarle un rol de staff mediante una operación de servidor auditada (un `insert` en `role_assignments`
   con clave de servidor). El primer administrador lo asigna el propietario del proyecto.
3. Publicar con `python -m app.services.knowledge_ingest --cache <caché> --remote --publish --approved-by <UUID>`.

## 8. RPC `match_knowledge_hybrid` contra Supabase real

| Llamada | Resultado |
|---|---|
| ES, clave de servidor, híbrida, vector real | HTTP 200, **0 filas** (puerta de aprobación) |
| EN, clave de servidor, híbrida | HTTP 200, 0 filas |
| PT-BR, clave de servidor, híbrida | HTTP 200, 0 filas |
| ES, clave de servidor, solo texto | HTTP 200, 0 filas |
| ES, clave **pública (anon)**, híbrida | **HTTP 401**, `permission denied for function` |

Las búsquedas ES/EN/PT con resultados reales **no se pueden demostrar** hasta publicar. Las pruebas con
resultados se hicieron en Postgres local efímero (`03_supabase_rag.md`).

## 9. FastAPI → Supabase → OpenRouter (real)

Petición firmada, RAG activado, Supabase real, OpenRouter real:

| Medida | Valor |
|---|---|
| `retrieval` | `lexical` (la RPC no devolvió filas: fallback local) |
| `embedding_status` / `rpc_status` | `ok` / `ok` |
| Modelo que respondió | `dots-studio/dots-3-note-preview:free` (fallback; primario Gemma en 429) |
| `degraded` | `false` |
| Fuentes | faq-01, faq-08, faq-02 (conocimiento aprobado local) |
| Latencia extremo a extremo | 14,3 s |

## 10. Consumo de API en esta fase

| Servicio | Peticiones | Coste |
|---|---|---|
| Supabase REST (escritura) | 1 (fuentes) + 3 (fragmentos) + 1 (ejecución) + 1 (idempotencia) | Plan del proyecto |
| Supabase REST (lectura, conteos) | 6 | — |
| Supabase RPC | 5 (4 servidor, 1 anon denegada) | — |
| Supabase Auth admin | 1 | — |
| OpenRouter embeddings | 0 nuevas en ingesta; 1 en la petición de chat | 0 (modelo gratuito) |
| OpenRouter chat | 1 petición (2 intentos por el primario en 429) | 0 (modelos `:free`) |
| Tavily search | **1** (1 crédito, `basic`, 1 resultado) | 1 crédito |

## 11. Variables de entorno (solo nombres)

Servidor: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (en el `.env` raíz; no se imprimieron valores).
Ya existentes: `OPENROUTER_API_KEY`. Nuevas para Tavily: `TAVILY_API_KEY` (presente en `.env`).
Activación: `RAG_ENABLED`, `TAVILY_ENABLED`, `TAVILY_EXTRACT_ENABLED` (todas `false` por defecto).

Aviso: `.env.supabase.local` contiene aún una clave `service_role` heredada escrita por error. Está ignorada
por Git; conviene borrarla o reemplazarla. No la he eliminado sin tu confirmación.
