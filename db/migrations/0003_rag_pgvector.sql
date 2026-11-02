-- Logixtic · 0003 · RAG con pgvector: fragmentos de conocimiento aprobado, embeddings y recuperación híbrida.
--
-- Requiere 0001 (knowledge_sources, has_role) y 0002 aplicadas.
-- Dimensión fijada por el modelo de embeddings verificado en la API real:
--   nvidia/nemotron-3.5-embed-1b:free -> 2048 dimensiones (una llamada real, coste 0).
-- Se usa halfvec: los índices HNSW de `vector` solo admiten hasta 2000 dimensiones; halfvec admite 4000.
-- Cambiar de modelo exige una migración nueva y reindexar: nunca mezclar dimensiones ni modelos.
--
-- Principios:
--   - Solo contenido de fuentes approved = true, cuya versión coincide con published_version.
--   - Anónimos y usuarios autenticados sin rol no leen ni escriben fragmentos, embeddings ni ejecuciones.
--   - La recuperación la ejecuta solo service_role (FastAPI), nunca el navegador.

begin;

create schema if not exists extensions;
create extension if not exists vector with schema extensions;

-- 1. Fragmentos de cada fuente publicada.
create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.knowledge_sources (id) on delete cascade,
  version text not null check (char_length(version) between 1 and 32),
  chunk_index integer not null check (chunk_index >= 0),
  locale text not null check (locale in ('es', 'en', 'pt-BR')),
  content text not null check (char_length(content) between 1 and 4000),
  content_sha256 text not null check (content_sha256 ~ '^[0-9a-f]{64}$'),
  embedding extensions.halfvec(2048) not null,
  embedding_model text not null check (char_length(embedding_model) between 1 and 120),
  embedding_dim integer not null default 2048 check (embedding_dim = 2048),
  tsv tsvector generated always as (to_tsvector('simple', content)) stored,
  created_at timestamptz not null default now(),
  unique (source_id, version, chunk_index),
  unique (source_id, version, content_sha256)
);

create index if not exists knowledge_chunks_tsv_idx
  on public.knowledge_chunks using gin (tsv);
create index if not exists knowledge_chunks_embedding_hnsw_idx
  on public.knowledge_chunks using hnsw (embedding extensions.halfvec_cosine_ops);
create index if not exists knowledge_chunks_locale_version_idx
  on public.knowledge_chunks (locale, version);

-- 2. Trazabilidad de cada ingesta (sin contenido ni secretos).
create table if not exists public.knowledge_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  version text not null check (char_length(version) between 1 and 32),
  embedding_model text not null check (char_length(embedding_model) between 1 and 120),
  embedding_dim integer not null check (embedding_dim = 2048),
  status text not null check (status in ('running', 'succeeded', 'failed')),
  sources_seen integer not null default 0 check (sources_seen >= 0),
  chunks_written integer not null default 0 check (chunks_written >= 0),
  chunks_skipped integer not null default 0 check (chunks_skipped >= 0),
  error_summary text check (error_summary is null or char_length(error_summary) <= 500),
  created_by uuid references auth.users (id)
);

-- 3. RLS: activada; sin políticas para anon. Staff solo lee; las escrituras van con service_role.
alter table public.knowledge_chunks enable row level security;
alter table public.knowledge_ingestion_runs enable row level security;

drop policy if exists knowledge_chunks_staff_read on public.knowledge_chunks;
create policy knowledge_chunks_staff_read on public.knowledge_chunks for select to authenticated
  using (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'));

drop policy if exists knowledge_runs_admin_read on public.knowledge_ingestion_runs;
create policy knowledge_runs_admin_read on public.knowledge_ingestion_runs for select to authenticated
  using (public.has_role('admin'));

revoke all on public.knowledge_chunks, public.knowledge_ingestion_runs from anon;
grant select on public.knowledge_chunks, public.knowledge_ingestion_runs to authenticated;

-- 4. Recuperación híbrida: vectorial + textual, fusionadas por Reciprocal Rank Fusion (k = 60).
--    Filtra aprobación, versión publicada e idioma. Deduplica por hash de contenido.
--    p_query_embedding NULL => solo textual (respaldo cuando el servicio de embeddings no responde).
create or replace function public.match_knowledge_hybrid(
  p_query_text text,
  p_query_embedding extensions.halfvec(2048),
  p_locale text,
  p_limit integer default 5,
  p_candidates integer default 30,
  p_min_similarity double precision default 0.35
)
returns table (
  chunk_id uuid,
  source_slug text,
  version text,
  content text,
  vector_rank integer,
  text_rank integer,
  score double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with approved as (
    select kc.id, kc.version, kc.content, kc.content_sha256, kc.embedding, kc.tsv, ks.slug
    from public.knowledge_chunks kc
    join public.knowledge_sources ks on ks.id = kc.source_id
    where ks.approved
      and ks.published_version = kc.version
      and ks.locale = p_locale
      and kc.locale = p_locale
  ),
  vec as (
    select a.id, row_number() over (order by a.embedding <=> p_query_embedding) as r
    from approved a
    where p_query_embedding is not null
      and 1 - (a.embedding <=> p_query_embedding) >= coalesce(p_min_similarity, 0.35)
    order by a.embedding <=> p_query_embedding
    limit greatest(1, least(coalesce(p_candidates, 30), 100))
  ),
  q as (
    -- OR entre términos: websearch_to_tsquery usa AND y deja vacía la rama textual con preguntas largas.
    select websearch_to_tsquery('simple', regexp_replace(trim(coalesce(p_query_text, '')), '\s+', ' OR ', 'g')) as query
  ),
  txt as (
    select a.id, row_number() over (order by ts_rank_cd(a.tsv, q.query) desc) as r
    from approved a, q
    where p_query_text is not null
      and length(trim(p_query_text)) > 0
      and a.tsv @@ q.query
    order by ts_rank_cd(a.tsv, q.query) desc
    limit greatest(1, least(coalesce(p_candidates, 30), 100))
  ),
  fused as (
    select coalesce(v.id, t.id) as id,
           v.r as vr,
           t.r as tr,
           coalesce(1.0 / (60 + v.r), 0) + coalesce(1.0 / (60 + t.r), 0) as score
    from vec v
    full join txt t on t.id = v.id
  ),
  ranked as (
    select f.id, f.vr, f.tr, f.score, a.slug, a.version, a.content,
           row_number() over (partition by a.content_sha256 order by f.score desc, a.slug) as dup_rank
    from fused f
    join approved a on a.id = f.id
  )
  select r.id as chunk_id,
         r.slug as source_slug,
         r.version,
         r.content,
         r.vr::integer as vector_rank,
         r.tr::integer as text_rank,
         r.score
  from ranked r
  where r.dup_rank = 1
    -- Con embedding, solo cuenta lo que supera el umbral vectorial: el texto ordena, no justifica.
    and (p_query_embedding is null or r.vr is not null)
  order by r.score desc, r.slug
  limit greatest(1, least(coalesce(p_limit, 5), 20));
$$;

revoke all on function public.match_knowledge_hybrid(
  text, extensions.halfvec, text, integer, integer, double precision)
  from public, anon, authenticated;
grant execute on function public.match_knowledge_hybrid(
  text, extensions.halfvec, text, integer, integer, double precision)
  to service_role;

commit;
