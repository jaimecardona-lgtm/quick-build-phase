-- Pruebas de RLS y roles para la migración 0001. Cada caso debe cumplirse; si no, el script falla.
\set ON_ERROR_STOP on

-- Usuarios de prueba (creados como superusuario, fuera de RLS).
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'), -- admin
  ('00000000-0000-0000-0000-00000000000b'), -- publisher
  ('00000000-0000-0000-0000-00000000000c'), -- editor
  ('00000000-0000-0000-0000-00000000000d'), -- commercial
  ('00000000-0000-0000-0000-00000000000e'); -- sin roles

insert into public.profiles (user_id, display_name) values
  ('00000000-0000-0000-0000-00000000000a', 'Admin prueba'),
  ('00000000-0000-0000-0000-00000000000b', 'Publisher prueba'),
  ('00000000-0000-0000-0000-00000000000c', 'Editor prueba'),
  ('00000000-0000-0000-0000-00000000000d', 'Comercial prueba'),
  ('00000000-0000-0000-0000-00000000000e', 'Sin roles');

insert into public.role_assignments (user_id, role, granted_by) values
  ('00000000-0000-0000-0000-00000000000a', 'admin', null),
  ('00000000-0000-0000-0000-00000000000b', 'publisher', '00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000c', 'editor', '00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000d', 'commercial', '00000000-0000-0000-0000-00000000000a');

insert into public.site_sections (section_key, position) values ('closing-note', 1);

-- Helper de aserción: falla el script con un mensaje claro.
create or replace function pg_temp.expect(cond boolean, label text) returns void language plpgsql as $$
begin
  if not cond then
    raise exception 'FALLO: %', label;
  end if;
  raise notice 'OK: %', label;
end $$;

-- Helper: intenta una acción y devuelve true si se rechaza (error de permisos o RLS).
create or replace function pg_temp.denied(sql_text text) returns boolean language plpgsql as $$
begin
  execute sql_text;
  return false;
exception when others then
  return true;
end $$;

-- ===== 1. Visitante anónimo =====
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.expect((select count(*) from public.site_section_versions) = 0, 'anon: no ve versiones sin publicar (cero filas)');
select pg_temp.expect(pg_temp.denied($q$insert into public.site_section_versions (section_key, locale, revision, state, payload, author_id) values ('closing-note','es',1,'draft','{}','00000000-0000-0000-0000-00000000000c')$q$), 'anon: no puede crear versiones');
select pg_temp.expect(pg_temp.denied($q$insert into public.leads (company, contact_name, email, source, consent_at) values ('Empresa','X','x@example.com','web',null)$q$), 'anon: lead sin consentimiento rechazado');
select pg_temp.expect(not pg_temp.denied($q$insert into public.leads (company, contact_name, email, source, consent_at) values ('Empresa Demo','Contacto','contacto@example.com','web',now())$q$), 'anon: lead con consentimiento permitido');
select pg_temp.expect(pg_temp.denied($q$select 1 from public.leads$q$), 'anon: no puede leer leads (permiso denegado)');
select pg_temp.expect(pg_temp.denied($q$select 1 from public.roi_scenarios$q$) and pg_temp.denied($q$select 1 from public.ai_messages$q$), 'anon: sin acceso a ROI ni mensajes de IA');
select pg_temp.expect(pg_temp.denied($q$select 1 from public.audit_logs$q$), 'anon: sin acceso a auditoría');
reset role;

-- ===== 2. Editor: borradores sí, publicar no =====
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000c', false);
insert into public.site_section_versions (id, section_key, locale, revision, state, payload, author_id)
values ('10000000-0000-0000-0000-000000000001', 'closing-note', 'es', 1, 'draft', '{"text":"Borrador"}', '00000000-0000-0000-0000-00000000000c');
select pg_temp.expect(pg_temp.denied($q$insert into public.site_section_versions (section_key, locale, revision, state, payload, author_id, approved_by, published_at) values ('closing-note','es',2,'published','{}','00000000-0000-0000-0000-00000000000c','00000000-0000-0000-0000-00000000000c', now())$q$), 'editor: no puede insertar versión publicada');
select pg_temp.expect(pg_temp.denied($q$update public.site_section_versions set state='published', approved_by='00000000-0000-0000-0000-00000000000c', published_at=now() where id='10000000-0000-0000-0000-000000000001'$q$), 'editor: no puede publicar su borrador');
select pg_temp.expect(pg_temp.denied($q$insert into public.role_assignments (user_id, role) values ('00000000-0000-0000-0000-00000000000c','admin')$q$), 'editor: no puede autoasignarse admin');
select pg_temp.expect(pg_temp.denied($q$insert into public.site_section_versions (section_key, locale, revision, state, payload, author_id) values ('closing-note','en',1,'draft','{}','00000000-0000-0000-0000-00000000000a')$q$), 'editor: no puede crear borradores a nombre de otro autor');
select pg_temp.expect((select count(*) from public.audit_logs) = 0, 'editor: no ve auditoría');
reset role;

-- ===== 3. Publisher publica con aprobador propio =====
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
update public.site_section_versions set state='published', approved_by='00000000-0000-0000-0000-00000000000b', published_at=now() where id='10000000-0000-0000-0000-000000000001';
select pg_temp.expect(pg_temp.denied($q$update public.site_section_versions set approved_by='00000000-0000-0000-0000-00000000000a' where id='10000000-0000-0000-0000-000000000001'$q$), 'publisher: no puede cambiar el aprobador de una publicación a otra persona');
reset role;

-- ===== 4. Visitante ve solo lo publicado =====
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.expect((select count(*) from public.site_section_versions where state='published') = 1, 'anon: ve la versión publicada');
select pg_temp.expect((select count(*) from public.site_section_versions where state <> 'published') = 0, 'anon: no ve borradores');
reset role;

-- ===== 5. Comercial: solo sus leads asignados =====
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000d', false);
reset role;
insert into public.leads (company, contact_name, email, source, consent_at, assigned_to)
values ('Asignado', 'A', 'a@example.com', 'web', now(), '00000000-0000-0000-0000-00000000000d'),
       ('No asignado', 'B', 'b@example.com', 'web', now(), '00000000-0000-0000-0000-00000000000a');
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000d', false);
select pg_temp.expect((select count(*) from public.leads) = 1, 'comercial: solo ve sus leads asignados');
reset role;

-- ===== 6. Auditoría: solo admin =====
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
select pg_temp.expect((select count(*) from public.audit_logs) >= 2, 'admin: ve la auditoría de versiones (insert y update)');
reset role;

-- ===== 7. Sin roles: no accede a nada interno =====
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000e', false);
select pg_temp.expect((select count(*) from public.role_assignments) = 0 and (select count(*) from public.leads) = 0, 'usuario sin roles: cero filas internas');
select pg_temp.expect(pg_temp.denied($q$insert into public.site_section_versions (section_key, locale, revision, state, payload, author_id) values ('closing-note','pt-BR',1,'draft','{}','00000000-0000-0000-0000-00000000000e')$q$), 'usuario sin roles: no crea versiones');
reset role;

select 'TODAS LAS PRUEBAS RLS PASARON' as resultado;
