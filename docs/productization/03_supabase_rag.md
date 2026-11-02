# 03 — Supabase PostgreSQL, pgvector y agente RAG

Rama: `feat/productizacion-staging`. Base de partida: commit `cba7bbb` (agente OpenRouter real).
Estado: **esquema, ingesta, recuperación híbrida e integración en FastAPI construidos y verificados en local
con servicios reales de embeddings y de chat. El proyecto Supabase autorizado NO se pudo enlazar desde esta
sesión: no se ha aplicado ninguna migración en remoto.**

## 1. Bloqueo remoto (Bloques 0 y 1)

| Comprobación | Resultado |
|---|---|
| Versión de Supabase CLI | `2.48.3` (la `3.0.0` está disponible) |
| Vinculación previa en este repo | Ninguna (no existía `supabase/`) |
| `supabase projects list` | Cuenta activa con organización `wbpczezeckehimlbzkiz`: proyectos `jaimecardona-lgtm's Project`, `rckt`, `tasksRCKT`, `rcktLatam`. **No aparece `logixtic` (`wjccxmpxhhavfmhgnqft`).** |
| `supabase link --project-ref wjccxmpxhhavfmhgnqft` | Error: *"Your account does not have the necessary privileges to access this endpoint"* |
| Acción tomada | **Ninguna sobre la cuenta.** No se ejecutó `supabase logout` porque afectaría a los otros proyectos de la CLI y la nueva autenticación requiere un navegador. |

Para desbloquear, el propietario de `logixtic` debe ejecutar (en su terminal):

```bash
supabase logout
supabase login          # con la cuenta que administra wjccxmpxhhavfmhgnqft
supabase link --project-ref wjccxmpxhhavfmhgnqft
supabase migration list --linked
```

Después de eso se puede continuar con `supabase db push --dry-run` y la aplicación real. No se usó `db reset`,
`migration repair` ni se eliminó ninguna tabla.

## 2. Migraciones

Fuentes (trazabilidad) y copias para la CLI, ordenadas por fecha:

| Fuente | Copia para la CLI | Contenido |
|---|---|---|
| `db/migrations/0001_roles_cms_leads_audit.sql` | `supabase/migrations/20261101000100_roles_cms_leads_audit.sql` | Roles, CMS, leads, auditoría (sin cambios) |
| `db/migrations/0002_public_ingress_hardening.sql` | `supabase/migrations/20261101000200_public_ingress_hardening.sql` | Quita la inserción anónima directa en `leads` |
| `db/migrations/0003_rag_pgvector.sql` | `supabase/migrations/20261102000300_rag_pgvector.sql` | RAG: pgvector, fragmentos, ingestas y recuperación híbrida |

Cada copia contiene el cuerpo de su fuente byte a byte (verificado), con una cabecera de trazabilidad. Si se
edita una fuente, hay que actualizar la copia.

Estado en remoto: **no aplicadas** (bloqueo de la sección 1).

## 3. Esquema creado por 0003

- Extensión `vector` en el esquema `extensions` (pgvector **0.8.7** en la imagen de prueba).
- `public.knowledge_chunks`: un fragmento por fila. Columnas: `source_id` (FK a `knowledge_sources`), `version`,
  `chunk_index`, `locale` (es/en/pt-BR), `content`, `content_sha256`, `embedding halfvec(2048)`,
  `embedding_model`, `embedding_dim` (= 2048), `tsv` (columna generada, `to_tsvector('simple')`).
  - Únicos: `(source_id, version, chunk_index)` y `(source_id, version, content_sha256)`.
  - Índices: GIN sobre `tsv`, **HNSW** `halfvec_cosine_ops` sobre `embedding`, y `(locale, version)`.
- `public.knowledge_ingestion_runs`: trazabilidad de cada ingesta (versión, modelo, dimensión, estado,
  contadores, `created_by`). Sin contenido.
- `public.match_knowledge_hybrid(p_query_text, p_query_embedding, p_locale, p_limit, p_candidates, p_min_similarity)`:
  recuperación híbrida. Solo devuelve fuentes con `approved = true` y versión igual a `published_version`,
  del idioma pedido. Fusiona búsqueda vectorial y textual por Reciprocal Rank Fusion (k = 60). Con embedding,
  solo entra lo que supera el umbral vectorial; el texto ordena pero no justifica. Deduplica por hash.
- **Por qué `halfvec`:** los índices HNSW de `vector` solo admiten 2000 dimensiones; el modelo tiene 2048.
- **RLS y privilegios:** RLS activada; `anon` sin ningún acceso; `authenticated` solo lee (roles editor, publisher,
  admin según `has_role`); la función solo tiene `EXECUTE` para `service_role`, que usa FastAPI con la clave
  de servidor. Ningún visitante escribe directamente.

## 4. Modelo de embeddings (Bloque 4)

Candidatos gratuitos disponibles en el catálogo de OpenRouter (consulta pública). Se descartaron los de pago
(p. ej. `baai/bge-m3`) por la restricción de no activar servicios de pago.

Elegido: **`nvidia/nemotron-3.5-embed-1b:free`**. Verificado con llamadas reales:

| Medida | Valor |
|---|---|
| Dimensión real | **2048** (medida en la API, no supuesta) |
| Coste | **0** (`cost: 0` en la respuesta) |
| Latencia de consulta única | 0,7 a 1,3 s |
| Lote de 54 textos aprobados | 2,9 s, una sola llamada |
| Calidad multilingüe | Recupera correctamente ES, EN y PT-BR (sección 6). Sin benchmark formal: ver riesgos |

El proveedor está detrás de la interfaz `EmbeddingProvider` (`backend/app/integrations/embeddings.py`). Ingesta
y consultas usan el mismo modelo y dimensión: la configuración los fija, y la ingesta rechaza vectores de otra
dimensión.

## 5. Ingesta (Bloque 5)

`python -m app.services.knowledge_ingest` (desde `backend/`):

- Valida: identificador, idioma, tipo, referencia de fuente, texto no vacío y **sin datos personales** (usa el
  mismo detector que el agente). Rechaza duplicados.
- Fragmenta por párrafos y frases (máximo 800 caracteres). Hash SHA-256 por fragmento.
- Embeddings solo para hashes no cacheados, en lotes de 32. La caché es local y se invalida si cambia el modelo.
- Genera SQL **idempotente**: `on conflict do nothing`, nunca `update` ni `delete` sobre fragmentos.
- **Publicación con puerta de aprobación:** sin `--publish` las fuentes entran con `approved = false`. Con
  `--publish` exige `--approved-by` con un UUID (que queda en `knowledge_ingestion_runs.created_by`, con
  clave foránea a `auth.users`).

Resultados (fuente: `approved_public_es.json`, versión `multi-2026-10-31`, Postgres pgvector efímero):

| Etapa | Fuentes | Aprobadas | Fragmentos | Ejecuciones |
|---|---|---|---|---|
| 1. Ingesta sin publicar | 54 | 0 | 54 | 1 |
| 2. Publicación con aprobador | 54 | 54 | 54 | 2 |
| 3. Repetición de la publicación | 54 | 54 | **54** (sin duplicados) | 3 |

Verificado también: `--publish` sin aprobador, y aprobador que no es UUID, se rechazan con error.

Caveat de contenido: los fragmentos guardan pregunta y respuesta juntas. Los saltos de línea del JSON original
incluyen `\r\n`. No afecta a la recuperación. Regla: **cambiar el contenido de una versión ya publicada añade
fragmentos a esa versión**; para cambiar contenido hay que crear una versión nueva.

## 6. Resultados de recuperación (consultas reales, Bloque 7)

Embeddings de consulta reales (modelo de la sección 4), búsqueda híbrida sobre Postgres con pgvector, como
`service_role`:

| Consulta | Modo | Resultados (fuentes) | Similitud coseno (mejor fragmento) |
|---|---|---|---|
| ES: ¿Cómo ayuda Logixtic con la gestión documental? | híbrido | faq-01, faq-05, faq-06, faq-03, faq-08 | 0,565 |
| EN: How does Logixtic help with document management? | híbrido | en-faq-01, en-faq-06, en-faq-08, en-faq-03, en-faq-02 | 0,562 |
| PT-BR: Como a Logixtic ajuda na gestão documental? | híbrido | pt-faq-05, pt-faq-01, pt-faq-06, pt-faq-03, pt-faq-08 | 0,582 |
| ES sin fuente: ¿Cuál es el precio por usuario en dólares? | híbrido | **ninguno** (cae al conocimiento local) | 0,233 |
| ES con embeddings caídos (cuota) | solo texto | faq-01, faq-06, faq-05, faq-09, faq-14 | — |
| ES con Supabase caído | — | fallo controlado en ~2,4 s, conocimiento local | — |

Latencia de la recuperación: 0,7 a 1,0 s con embedding real; la consulta SQL sola 0,23 a 0,26 s.

**Calibración del umbral:** `RAG_MIN_SIMILARITY = 0,35`. Está entre los 0,233 de la pregunta sin fuente y los
0,54 a 0,58 de las relevantes. **Solo se midieron cuatro consultas**: es una calibración inicial, no un
benchmark. Antes de confiar en el umbral con tráfico real hay que medir un conjunto más amplio.

Descubrimientos que cambiaron el diseño durante la prueba (se corrigieron):
- `websearch_to_tsquery` une términos con AND y dejaba vacía la rama textual. Ahora se usa OR.
- Sin umbral en la rama vectorial, las coincidencias solo textuales llenaban los resultados de preguntas sin
  relación. Ahora, en modo híbrido, solo cuenta lo que supera el umbral vectorial.

## 7. Integración en FastAPI (Bloque 6)

Flujo: pregunta → clasificación social (sin RAG para saludos y cortesía) → **recuperación híbrida** (embedding,
RPC a Supabase con la clave de servidor en `apikey`) → si no hay resultados o falla algo, **conocimiento local
(lexical)** → modelo OpenRouter (primario/fallback) → Judge (si está activo) → respuesta con fuentes.

- `RAG_ENABLED=false` por defecto: el comportamiento es el de la versión anterior.
- El embedding y la RPC respetan el reloj total del agente y el presupuesto diario de llamadas.
- Métricas nuevas (sin texto): `retrieval` (`rag_hybrid`, `rag_text`, `lexical`), `embedding_status`, `rpc_status`.

Prueba de integración real (FastAPI local con RAG activado, petición firmada con HMAC, Supabase simulado con
su gateway, OpenRouter real):

| Medida | Valor |
|---|---|
| `retrieval` | `rag_hybrid` |
| `embedding_status` / `rpc_status` | `ok` / `ok` |
| Modelo que respondió | `liquid/lfm-2.5-2.6b:free` (el primario Gemma devolvió 429 en esta sesión) |
| `degraded` / `dry_run` | `false` / `false` |
| Fuentes | faq-01, faq-05, faq-06, faq-08, faq-02 |
| Latencia extremo a extremo | 5,9 s |

Contenedor all-in-one con RAG desactivado (la configuración de Render): arranca, `/healthz` 200, 132 MiB de
512 MiB, sin la carpeta `supabase/` dentro de la imagen.

## 8. Pruebas y lo que es real o simulado

| Tipo | Qué | Estado |
|---|---|---|
| **Real** | Embeddings de OpenRouter (modelo gratuito, 2048 dimensiones): 54 textos y 4 consultas | Verificado |
| **Real** | Chat de OpenRouter a través de FastAPI con RAG activado | Verificado (una petición) |
| **Real** | Postgres 16 + pgvector 0.8.7 **efímero local** (migraciones 0001 a 0003, ingesta, búsqueda) | Verificado |
| **Real** | PostgREST 12.2.3 local ejecutando la función como `service_role` | Verificado |
| **Simulado** | Gateway de Supabase (`/rest/v1`, clave de servidor en `apikey`): proxy local que solo acepta esa clave | Simulación; comportamiento real de Supabase no verificado |
| **Simulado** | Proyecto Supabase `logixtic` remoto | **No accesible**: no hay nada aplicado |
| Unitarias | 207 pruebas Python con transportes simulados (36 nuevas en `tests/test_rag.py`: ingesta, embeddings, recuperación y orquestación) | Pasan |
| SQL | 17 pruebas de 0003 + 19 de 0001 + 10 de 0002 en Postgres efímero | Pasan |

Lo que **no** se afirma: que el RAG esté operativo en Render o en el proyecto Supabase remoto. Eso requiere el
desbloqueo de la sección 1, la aplicación de migraciones, la ingesta contra ese proyecto y una prueba de
consulta real allí.

## 9. Variables para Render (solo nombres; valores fuera del repo)

Ya existentes: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `OPENROUTER_API_KEY`, `INTERNAL_HMAC_SECRET`.

Nuevas (opcionales; con los valores por defecto el RAG queda apagado):
`RAG_ENABLED` (dejar en `false` hasta la prueba remota), `RAG_EMBEDDING_MODEL`, `RAG_EMBEDDING_DIMENSION` (solo
`2048`), `RAG_TIMEOUT_SECONDS`, `RAG_TOP_K`, `RAG_CANDIDATES`, `RAG_MIN_SIMILARITY`.

`LEADS_ENABLED` sigue en `false`. Ninguna variable `VITE_*` contiene secretos. El Blueprint `render.yaml` no
cambia: un único servicio.

## 10. Respaldo y recuperación (procedimiento)

Antes de aplicar en remoto:
1. Copia de seguridad completa: `supabase db dump --linked -f backup_pre_0003.sql` (o `pg_dump` con la cadena de
   conexión del proyecto, sin pegarla en chats).
2. Confirmar `supabase db push --dry-run` sin cambios inesperados.

Recuperación:
- **Apagar el RAG sin redeploy de código:** `RAG_ENABLED=false`. El agente vuelve al conocimiento local.
- **Revertir una versión publicada:** `update public.knowledge_sources set published_version = '<versión anterior>'`
  para las fuentes afectadas. Los fragmentos de versiones anteriores siguen en la base (no se borran).
- **Reingestar:** la ingesta es idempotente; repetirla no duplica. Para cambios de contenido, usar una versión nueva.
- **Restaurar la base:** desde la copia de seguridad del punto 1. Las migraciones de 0003 son aditivas (no eliminan
  nada); no se incluye un script de reversión automático.

## 11. Riesgos y pendientes

1. **Proyecto remoto sin acceso desde esta sesión.** Bloquea toda la fase remota (sección 1).
2. **Calibración del umbral** con cuatro consultas. Hay que medir con un conjunto amplio.
3. **Modelo de embeddings gratuito**: sin SLA; la cuota gratuita devuelve 429 (ya observado). La ruta de
   respaldo textual lo cubre, con menor precisión.
4. **Primario de chat Gemma en 429** de forma sostenida. Conviene decidir el primario definitivo.
5. **Contenido de fragmentos**: pregunta y respuesta juntas; el texto extractivo puede repetir la pregunta.
6. **Versiones inmutables** solo por convención: la base no impide añadir fragmentos nuevos a una versión ya
   publicada si su contenido cambia (el hash es distinto).
7. **Gateway de Supabase simulado**: el comportamiento real de la clave `sb_secret_*` en el gateway de Supabase
   debe verificarse en el proyecto.
8. **Métricas de latencia** medidas en local: en Render Free (0,1 vCPU) serán mayores.
9. **Ningún commit ni despliegue** realizado en esta fase.

## 12. Control de acceso (resumen)

| Rol de acceso | Fragmentos y ejecuciones RAG | Función de recuperación | Fuentes y aprobación | Prospectos (`leads`) |
|---|---|---|---|---|
| `anon` (visitante) | Sin acceso | Sin ejecución | Sin acceso | Sin acceso ni inserción directa (0002) |
| `authenticated` sin rol | Sin acceso | Sin ejecución | Sin acceso | Sin acceso |
| `authenticated` editor / publisher | Solo lectura de fragmentos | Sin ejecución | Lectura; publicar según `has_role` | Sin acceso |
| `authenticated` admin | Lectura de fragmentos y de ejecuciones | Sin ejecución | Gestión | Lectura según 0001 |
| `service_role` (FastAPI, clave de servidor) | Completo | Ejecuta | Escribe en la ingesta | Inserta desde el endpoint, con consentimiento |

Verificado en Postgres efímero: anon no lee fragmentos ni ejecuta la función; autenticado sin rol no ve nada;
publicador lee y no escribe; `service_role` ejecuta. 17 comprobaciones en `db/tests/0003_rag_test.sql`.
**Pendiente:** esas mismas comprobaciones contra el proyecto Supabase real, cuando la CLI esté autenticada.

## 13. Versiones de conocimiento

- Una versión (`published_version`) es el conjunto de fragmentos que el agente puede usar. La ingesta nunca borra.
- Cambiar contenido de una versión ya publicada no sustituye fragmentos: hay que crear una versión nueva
  (p. ej. `multi-2026-11-15`) y publicarla. La versión anterior queda disponible para revertir.
- Publicar exige aprobador (UUID real en `auth.users`). La fila de `knowledge_ingestion_runs` deja la trazabilidad.
