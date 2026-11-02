-- Pruebas de endurecimiento de la migración 0002. SOLO para una base local efímera (contenedor
-- desechable) con 0000_auth_shim_for_tests.sql y 0001 aplicados. No ejecutar contra la nube.
\set ON_ERROR_STOP on

begin;

-- Usuarios de prueba (superusuario, fuera de RLS).
insert into auth.users (id) values
  ('10000000-0000-0000-0000-00000000000a'), -- admin
  ('10000000-0000-0000-0000-00000000000d'), -- commercial
  ('10000000-0000-0000-0000-00000000000e'), -- commercial 2
  ('10000000-0000-0000-0000-00000000000b'), -- publisher
  ('10000000-0000-0000-0000-00000000000f'); -- sin roles

-- has_role() exige perfil: sin fila en profiles, ningún rol cuenta (comportamiento intencional).
insert into public.profiles (user_id, display_name) values
  ('10000000-0000-0000-0000-00000000000a', 'Admin prueba'),
  ('10000000-0000-0000-0000-00000000000d', 'Comercial prueba'),
  ('10000000-0000-0000-0000-00000000000e', 'Comercial prueba 2'),
  ('10000000-0000-0000-0000-00000000000b', 'Publicador prueba'),
  ('10000000-0000-0000-0000-00000000000f', 'Sin roles');

insert into public.role_assignments (user_id, role, granted_by) values
  ('10000000-0000-0000-0000-00000000000a', 'admin', null),
  ('10000000-0000-0000-0000-00000000000d', 'commercial', '10000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-00000000000e', 'commercial', '10000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-00000000000b', 'publisher', '10000000-0000-0000-0000-00000000000a');

create or replace function pg_temp.expect(cond boolean, label text) returns void language plpgsql as $$
begin
  if not cond then
    raise exception 'PRUEBA FALLIDA: %', label;
  end if;
  raise notice 'OK: %', label;
end;
$$;

-- Lead de prueba creado por el servicio (superusuario simula service_role con BYPASSRLS).
insert into public.leads (company, contact_name, email, source, consent_at, assigned_to, privacy_notice_version, dedupe_key)
values
  ('Agencia Prueba Uno', 'Contacto Uno', 'uno@example.test', 'web', now(), '10000000-0000-0000-0000-00000000000d', 'v1', 'k-uno'),
  ('Agencia Prueba Dos', 'Contacto Dos', 'dos@example.test', 'web', now(), '10000000-0000-0000-0000-00000000000e', 'v1', 'k-dos');

-- 1. Anónimo: no puede insertar directamente.
set local role anon;
do $$
begin
  insert into public.leads (company, contact_name, email, source, consent_at)
  values ('Anon Intento', 'Anon', 'anon@example.test', 'web', now());
  perform pg_temp.expect(false, 'anon no puede insertar leads');
exception when insufficient_privilege then
  perform pg_temp.expect(true, 'anon no puede insertar leads');
end
$$;

-- 2. Anónimo: no puede leer leads.
do $$
declare n integer;
begin
  select count(*) into n from public.leads;
  perform pg_temp.expect(false, 'anon no puede leer leads (obtuvo ' || n || ')');
exception when insufficient_privilege then
  perform pg_temp.expect(true, 'anon no puede leer leads');
end
$$;
reset role;

-- 3. Autenticado sin rol: no ve ni inserta.
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000f';
do $$
declare n integer;
begin
  select count(*) into n from public.leads;
  perform pg_temp.expect(n = 0, 'usuario sin rol no ve leads');
end
$$;
reset role;

-- 4. Comercial: solo ve los suyos.
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000d';
do $$
declare n integer; mine integer;
begin
  select count(*) into n from public.leads;
  select count(*) into mine from public.leads where assigned_to = '10000000-0000-0000-0000-00000000000d';
  perform pg_temp.expect(n = 1 and mine = 1, 'comercial solo ve sus leads');
end
$$;
reset role;

-- 5. Publicador: no lee prospectos.
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000b';
do $$
declare n integer;
begin
  select count(*) into n from public.leads;
  perform pg_temp.expect(n = 0, 'publicador no lee prospectos');
end
$$;
reset role;

-- 6. Admin: ve todos.
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-00000000000a';
do $$
declare n integer;
begin
  select count(*) into n from public.leads;
  perform pg_temp.expect(n = 2, 'admin ve todos los leads');
end
$$;
reset role;

-- 7. Idempotencia: misma clave de deduplicación no crea duplicados.
do $$
begin
  insert into public.leads (company, contact_name, email, source, consent_at, dedupe_key)
  values ('Duplicado', 'Dup', 'dup@example.test', 'web', now(), 'k-uno');
  perform pg_temp.expect(false, 'dedupe_key duplicada es rechazada');
exception when unique_violation then
  perform pg_temp.expect(true, 'dedupe_key duplicada es rechazada');
end
$$;

-- 8. Versión de aviso de privacidad obligatoria (tiene valor por defecto explícito).
do $$
declare v text;
begin
  insert into public.leads (company, contact_name, email, source, consent_at, dedupe_key)
  values ('Sin Version', 'Sv', 'sv@example.test', 'web', now(), 'k-sv')
  returning privacy_notice_version into v;
  perform pg_temp.expect(v = 'unversioned', 'version de aviso por defecto registrada');
end
$$;

-- 9. Purga: anónimo no puede ejecutarla; service_role sí.
set local role anon;
do $$
begin
  perform public.purge_expired_ai_data();
  perform pg_temp.expect(false, 'anon no puede ejecutar la purga');
exception when insufficient_privilege then
  perform pg_temp.expect(true, 'anon no puede ejecutar la purga');
end
$$;
reset role;

set local role service_role;
do $$
declare removed integer;
begin
  removed := public.purge_expired_ai_data();
  perform pg_temp.expect(removed >= 0, 'service_role ejecuta la purga');
end
$$;
reset role;

rollback;
