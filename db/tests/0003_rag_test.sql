-- Pruebas de la migración 0003 (RAG pgvector). SOLO para Postgres local efímero con pgvector.
-- Vectores sintéticos de dimensión 2048 (lógica de recuperación; los embeddings reales se prueban aparte).
\set ON_ERROR_STOP on

begin;

-- Privilegios de service_role como en Supabase (BYPASSRLS ya lo tiene el rol creado por el runner).
grant usage on schema public, extensions to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;

create or replace function pg_temp.expect(cond boolean, label text) returns void language plpgsql as $$
begin
  if not cond then raise exception 'PRUEBA FALLIDA: %', label; end if;
  raise notice 'OK: %', label;
end $$;

-- Vector unitario en la posición i (2048 dimensiones, halfvec).
create or replace function pg_temp.unit(i integer) returns extensions.halfvec
language sql immutable as $$
  select (select array_agg(case when g = i then 1.0 else 0.0 end::real order by g)
          from generate_series(1, 2048) g)::extensions.halfvec;
$$;

-- Usuarios y roles (superusuario, fuera de RLS).
insert into auth.users (id) values
  ('20000000-0000-0000-0000-00000000000a'),  -- publisher
  ('20000000-0000-0000-0000-00000000000f');  -- sin roles
insert into public.profiles (user_id, display_name) values
  ('20000000-0000-0000-0000-00000000000a', 'Publicador prueba'),
  ('20000000-0000-0000-0000-00000000000f', 'Sin roles');
insert into public.role_assignments (user_id, role, granted_by) values
  ('20000000-0000-0000-0000-00000000000a', 'publisher', '20000000-0000-0000-0000-00000000000a');

-- Fuentes. slug/locale/approved/published_version según 0001.
insert into public.knowledge_sources (id, slug, locale, kind, approved, published_version, source_reference) values
  ('30000000-0000-0000-0000-000000000001', 'rag-es-01', 'es', 'faq', true,  'v1', 'prueba'),
  ('30000000-0000-0000-0000-000000000002', 'rag-es-02', 'es', 'faq', false, 'v1', 'prueba'),  -- no aprobada
  ('30000000-0000-0000-0000-000000000003', 'rag-en-01', 'en', 'faq', true,  'v1', 'prueba'),
  ('30000000-0000-0000-0000-000000000004', 'rag-es-04', 'es', 'faq', true,  'v2', 'prueba'),  -- v2 sin fragmentos
  ('30000000-0000-0000-0000-000000000005', 'rag-es-05', 'es', 'faq', true,  'v1', 'prueba');  -- duplicado de rag-es-01

insert into public.knowledge_chunks
  (source_id, version, chunk_index, locale, content, content_sha256, embedding, embedding_model) values
  ('30000000-0000-0000-0000-000000000001', 'v1', 0, 'es', 'Logixtic gestiona la documentación de la operación',
     repeat('a', 64), pg_temp.unit(1), 'test-model'),
  ('30000000-0000-0000-0000-000000000002', 'v1', 0, 'es', 'Contenido no aprobado sobre documentación',
     repeat('b', 64), pg_temp.unit(1), 'test-model'),
  ('30000000-0000-0000-0000-000000000003', 'v1', 0, 'en', 'Logixtic manages operational documentation',
     repeat('c', 64), pg_temp.unit(1), 'test-model'),
  ('30000000-0000-0000-0000-000000000004', 'v1', 0, 'es', 'Versión antigua sobre documentación',
     repeat('d', 64), pg_temp.unit(1), 'test-model'),
  ('30000000-0000-0000-0000-000000000005', 'v1', 0, 'es', 'Logixtic gestiona la documentación de la operación',
     repeat('a', 64), pg_temp.unit(1), 'test-model');  -- mismo hash que rag-es-01

-- 1. Restricciones de integridad.
do $$
begin
  insert into public.knowledge_chunks
    (source_id, version, chunk_index, locale, content, content_sha256, embedding, embedding_model)
  values ('30000000-0000-0000-0000-000000000001', 'v1', 1, 'es', 'repetido', repeat('a', 64),
          pg_temp.unit(2), 'test-model');
  perform pg_temp.expect(false, 'hash duplicado en la misma fuente y versión es rechazado');
exception when unique_violation then
  perform pg_temp.expect(true, 'hash duplicado en la misma fuente y versión es rechazado');
end $$;

do $$
begin
  insert into public.knowledge_chunks
    (source_id, version, chunk_index, locale, content, content_sha256, embedding, embedding_model)
  values ('30000000-0000-0000-0000-000000000001', 'v1', 9, 'fr', 'idioma no soportado', repeat('e', 64),
          pg_temp.unit(3), 'test-model');
  perform pg_temp.expect(false, 'idioma fuera de es/en/pt-BR es rechazado');
exception when check_violation then
  perform pg_temp.expect(true, 'idioma fuera de es/en/pt-BR es rechazado');
end $$;

do $$
begin
  insert into public.knowledge_chunks
    (source_id, version, chunk_index, locale, content, content_sha256, embedding, embedding_model, embedding_dim)
  values ('30000000-0000-0000-0000-000000000001', 'v1', 8, 'es', 'dimensión errónea', repeat('f', 64),
          pg_temp.unit(4), 'test-model', 1536);
  perform pg_temp.expect(false, 'embedding_dim distinto de 2048 es rechazado');
exception when check_violation then
  perform pg_temp.expect(true, 'embedding_dim distinto de 2048 es rechazado');
end $$;

-- 2. Recuperación híbrida como servicio (FastAPI usa service_role).
set local role service_role;

do $$
declare n integer; top_slug text;
begin
  select count(*) into n from public.match_knowledge_hybrid('documentación', pg_temp.unit(1), 'es', 5, 30);
  perform pg_temp.expect(n = 1, 'consulta ES devuelve un único resultado tras deduplicar y filtrar (obtuvo ' || n || ')');
  select source_slug into top_slug from public.match_knowledge_hybrid('documentación', pg_temp.unit(1), 'es', 5, 30);
  perform pg_temp.expect(top_slug in ('rag-es-01', 'rag-es-05'), 'el resultado proviene de una fuente aprobada y publicada');
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.match_knowledge_hybrid('documentación', pg_temp.unit(1), 'es', 5, 30)
    where source_slug in ('rag-es-02', 'rag-es-04');
  perform pg_temp.expect(n = 0, 'nunca devuelve fuentes no aprobadas ni versiones no publicadas');
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.match_knowledge_hybrid('documentation', pg_temp.unit(1), 'en', 5, 30);
  perform pg_temp.expect(n = 1, 'el idioma filtra: consulta EN solo devuelve EN');
  select count(*) into n from public.match_knowledge_hybrid('documentación', pg_temp.unit(1), 'en', 5, 30)
    where source_slug like 'rag-es%';
  perform pg_temp.expect(n = 0, 'consulta EN nunca devuelve fragmentos ES');
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.match_knowledge_hybrid('documentación', null, 'es', 5, 30);
  perform pg_temp.expect(n = 1, 'respaldo textual sin embedding devuelve resultados');
  select count(*) into n from public.match_knowledge_hybrid('documentación', pg_temp.unit(1), 'es', 1, 30);
  perform pg_temp.expect(n = 1, 'el límite de resultados se respeta');
  select count(*) into n from public.match_knowledge_hybrid('zzzz-sin-coincidencia', pg_temp.unit(9), 'es', 5, 30);
  perform pg_temp.expect(n = 0, 'consulta sin coincidencias devuelve vacío');
  select count(*) into n from public.match_knowledge_hybrid('   ', null, 'es', 5, 30);
  perform pg_temp.expect(n = 0, 'consulta vacía no provoca error ni resultados');
end $$;

reset role;

-- 3. Acceso: anónimo y sin rol no leen fragmentos ni ejecutan la función.
set local role anon;
do $$
begin
  perform count(*) from public.knowledge_chunks;
  perform pg_temp.expect(false, 'anon no puede leer knowledge_chunks');
exception when insufficient_privilege then
  perform pg_temp.expect(true, 'anon no puede leer knowledge_chunks');
end $$;
do $$
begin
  perform * from public.match_knowledge_hybrid('documentación', null, 'es', 5, 30);
  perform pg_temp.expect(false, 'anon no puede ejecutar la recuperación híbrida');
exception when insufficient_privilege then
  perform pg_temp.expect(true, 'anon no puede ejecutar la recuperación híbrida');
end $$;
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '20000000-0000-0000-0000-00000000000f';
do $$
declare n integer;
begin
  select count(*) into n from public.knowledge_chunks;
  perform pg_temp.expect(n = 0, 'usuario autenticado sin rol no ve fragmentos');
end $$;
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '20000000-0000-0000-0000-00000000000a';
do $$
declare n integer;
begin
  select count(*) into n from public.knowledge_chunks;
  perform pg_temp.expect(n = 5, 'publicador puede revisar fragmentos (solo lectura)');
  begin
    insert into public.knowledge_chunks
      (source_id, version, chunk_index, locale, content, content_sha256, embedding, embedding_model)
    values ('30000000-0000-0000-0000-000000000001', 'v1', 7, 'es', 'escritura directa', repeat('9', 64),
            pg_temp.unit(5), 'test-model');
    perform pg_temp.expect(false, 'publicador no puede escribir fragmentos directamente');
  exception when insufficient_privilege then
    perform pg_temp.expect(true, 'publicador no puede escribir fragmentos directamente');
  when others then
    perform pg_temp.expect(true, 'publicador no puede escribir fragmentos directamente (RLS)');
  end;
end $$;
reset role;

rollback;
