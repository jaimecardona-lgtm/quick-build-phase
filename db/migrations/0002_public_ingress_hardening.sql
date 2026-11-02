-- Logixtic · 0002 · Endurecimiento de la entrada pública (leads) y purga de datos del agente.
--
-- Requiere 0001 aplicada. Idempotente en lo posible (if exists / if not exists / create or replace).
-- Objetivo principal: el navegador (anon y authenticated) ya NO puede insertar en public.leads.
-- Los prospectos entran solo a través de FastAPI, que usa la clave secreta de servicio tras validar
-- HMAC, consentimiento explícito, antispam y límites de frecuencia.
--
-- Ninguna tabla de CRM operativo, embarques ni datos de tenants forma parte de este esquema.

begin;

-- 1. Cerrar la escritura anónima directa.
drop policy if exists leads_public_insert on public.leads;
revoke insert on public.leads from anon, authenticated;

-- 2. Idioma del formulario, versión del aviso de privacidad aceptada y clave de deduplicación
--    (hash derivado, sin PII en claro).
alter table public.leads
  add column if not exists locale text
    check (locale is null or locale in ('es', 'en', 'pt-BR'));

alter table public.leads
  add column if not exists privacy_notice_version text not null default 'unversioned'
    check (char_length(privacy_notice_version) between 1 and 32);

alter table public.leads
  add column if not exists dedupe_key text;

create unique index if not exists leads_dedupe_key_uidx
  on public.leads (dedupe_key)
  where dedupe_key is not null;

-- 3. Índices para la lectura comercial y la purga de sesiones.
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_assigned_to_idx on public.leads (assigned_to);
create index if not exists ai_sessions_expires_at_idx on public.ai_sessions (expires_at);
create index if not exists ai_messages_created_at_idx on public.ai_messages (created_at);

-- 4. Purga de sesiones vencidas. Los mensajes caen por ON DELETE CASCADE.
-- Solo la clave de servicio (o un job del propietario) puede ejecutarla.
create or replace function public.purge_expired_ai_data()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.ai_sessions where expires_at < now();
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_expired_ai_data() from public, anon, authenticated;
grant execute on function public.purge_expired_ai_data() to service_role;

-- 5. Privilegios: el público no toca leads ni datos del agente, ni siquiera en lectura.
revoke all on public.leads, public.ai_sessions, public.ai_messages from anon;

commit;
