-- SOLO PARA PRUEBAS LOCALES (contenedor desechable). Simula el esquema de identidad de Supabase/Lovable Cloud.
-- No se aplica nunca a una base real.
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end
$$;

grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
-- Como en Supabase, los roles de API reciben privilegios sobre el esquema; RLS decide qué filas se ven.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Como Supabase: los objetos que cree el propietario (la migración) reciben estos privilegios por defecto;
-- las políticas RLS y los revokes de la migración deciden lo que realmente se permite.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated, anon;
alter default privileges in schema public grant usage, select on sequences to authenticated, anon;
