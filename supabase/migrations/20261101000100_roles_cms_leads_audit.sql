-- Copia para Supabase CLI. Fuente de trazabilidad: db/migrations/0001_roles_cms_leads_audit.sql
-- No editar esta copia sin actualizar la fuente; ambas deben coincidir (ver docs/productization/03_supabase_rag.md).
-- Logixtic · 0001 · Roles, CMS por secciones, medios, leads, ROI/IA (cerrado), conocimiento y auditoría.
--
-- Supone un esquema de identidad compatible con Supabase Auth (esquema auth, función auth.uid() y roles
-- anon / authenticated). Verificar contra la configuración real de Lovable Cloud ANTES de aplicar.
-- NO aplicado todavía: no hay acceso a Lovable Cloud desde el entorno de desarrollo.
-- Ninguna tabla de CRM operativo, embarques ni datos de tenants de Logixtic forma parte de este esquema.

begin;

create type public.app_role as enum ('admin', 'publisher', 'editor', 'commercial');

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Rol validado en servidor (base de datos). Nunca se toma de claims suministrados por el cliente.
create or replace function public.has_role(_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_assignments ra
    join public.profiles p on p.user_id = ra.user_id
    where ra.user_id = auth.uid()
      and ra.role = _role
      and p.active
  );
$$;

create table public.site_sections (
  section_key text primary key check (section_key ~ '^[a-z][a-z0-9-]{2,60}$'),
  position int not null check (position >= 0),
  enabled boolean not null default true,
  current_published_version_id uuid
);

create table public.site_section_versions (
  id uuid primary key default gen_random_uuid(),
  section_key text not null references public.site_sections (section_key) on delete cascade,
  locale text not null check (locale in ('es', 'en', 'pt-BR')),
  revision int not null check (revision > 0),
  state text not null check (state in ('draft', 'review', 'published', 'archived')),
  payload jsonb not null,
  author_id uuid not null references auth.users (id),
  approved_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (section_key, locale, revision),
  check (state <> 'published' or (approved_by is not null and published_at is not null))
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,120}$'),
  status text not null default 'draft' check (status in ('draft', 'review', 'published')),
  author_id uuid not null references auth.users (id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);

create table public.blog_translations (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  locale text not null check (locale in ('es', 'en', 'pt-BR')),
  title text not null check (char_length(title) between 1 and 200),
  excerpt text,
  body text not null,
  seo_meta jsonb not null default '{}'::jsonb,
  primary key (post_id, locale)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_key text not null unique,
  mime text not null,
  source_url text,
  license_reference text,
  alt_by_locale jsonb not null default '{}'::jsonb,
  uploaded_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Leads: el visitante solo puede insertar con consentimiento explícito. Nadie anónimo puede leer.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  company text not null check (char_length(company) between 2 and 160),
  contact_name text not null check (char_length(contact_name) between 1 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source text not null check (char_length(source) between 1 and 80),
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  assigned_to uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- ROI y agente: sin acceso directo desde el cliente. Solo la pasarela (service role) escribe aquí.
create table public.roi_scenarios (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_hash text not null,
  inputs jsonb not null,
  assumptions_version text not null,
  outputs jsonb not null,
  created_at timestamptz not null default now()
);

create table public.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  redacted_content text not null,
  model text,
  usage jsonb,
  created_at timestamptz not null default now()
);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  locale text not null check (locale in ('es', 'en', 'pt-BR')),
  kind text not null check (kind in ('faq', 'product', 'plan', 'blog', 'other')),
  approved boolean not null default false,
  published_version text,
  source_reference text not null,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  resource_type text not null,
  resource_id text not null,
  action text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

-- Auditoría de versiones: la escribe un trigger (security definer); ningún cliente inserta directamente.
create or replace function public.audit_section_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, resource_type, resource_id, action, before, after)
  values (
    auth.uid(),
    'site_section_version',
    new.id::text,
    tg_op,
    case when tg_op = 'UPDATE' then to_jsonb(old) else null end,
    to_jsonb(new)
  );
  return new;
end;
$$;

create trigger site_section_versions_audit
after insert or update on public.site_section_versions
for each row execute function public.audit_section_version();

-- ---------------------------------------------------------------------------------------------
-- RLS: activada en todas las tablas. Sin política = denegado para anon y authenticated.
-- ---------------------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.role_assignments enable row level security;
alter table public.site_sections enable row level security;
alter table public.site_section_versions enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_translations enable row level security;
alter table public.media_assets enable row level security;
alter table public.leads enable row level security;
alter table public.roi_scenarios enable row level security;
alter table public.ai_sessions enable row level security;
alter table public.ai_messages enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: cada usuario ve el suyo; admin ve y administra todos.
create policy profiles_select on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.has_role('admin'));
create policy profiles_admin_write on public.profiles for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- role_assignments: solo admin lee y asigna. Un usuario puede ver sus propios roles.
create policy roles_select on public.role_assignments for select to authenticated
  using (user_id = auth.uid() or public.has_role('admin'));
create policy roles_admin_write on public.role_assignments for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- site_sections: lectura pública (estructura de la web), escritura publisher/admin.
create policy sections_public_read on public.site_sections for select to anon, authenticated
  using (true);
create policy sections_publisher_write on public.site_sections for all to authenticated
  using (public.has_role('publisher') or public.has_role('admin'))
  with check (public.has_role('publisher') or public.has_role('admin'));

-- site_section_versions: el público solo ve versiones publicadas.
create policy versions_public_read on public.site_section_versions for select to anon, authenticated
  using (state = 'published');
create policy versions_staff_read on public.site_section_versions for select to authenticated
  using (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'));
-- Editor: crea borradores propios y los modifica mientras no estén publicados.
create policy versions_editor_insert on public.site_section_versions for insert to authenticated
  with check (
    author_id = auth.uid()
    and state in ('draft', 'review')
    and (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'))
  );
create policy versions_editor_update on public.site_section_versions for update to authenticated
  using (author_id = auth.uid() and state in ('draft', 'review'))
  with check (state in ('draft', 'review'));
-- Publicación: solo publisher/admin, con aprobador registrado.
create policy versions_publisher_update on public.site_section_versions for update to authenticated
  using (public.has_role('publisher') or public.has_role('admin'))
  with check (
    (public.has_role('publisher') or public.has_role('admin'))
    and (state <> 'published' or approved_by = auth.uid())
  );
create policy versions_admin_delete on public.site_section_versions for delete to authenticated
  using (public.has_role('admin'));

-- blog: público ve publicados; editores escriben borradores; publisher/admin publican.
create policy blog_posts_public_read on public.blog_posts for select to anon, authenticated
  using (status = 'published');
create policy blog_posts_staff_read on public.blog_posts for select to authenticated
  using (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'));
create policy blog_posts_editor_write on public.blog_posts for all to authenticated
  using (public.has_role('publisher') or public.has_role('admin') or (public.has_role('editor') and author_id = auth.uid()))
  with check (
    public.has_role('publisher') or public.has_role('admin')
    or (public.has_role('editor') and author_id = auth.uid() and status <> 'published')
  );

create policy blog_tr_public_read on public.blog_translations for select to anon, authenticated
  using (exists (select 1 from public.blog_posts p where p.id = post_id and p.status = 'published'));
create policy blog_tr_staff_write on public.blog_translations for all to authenticated
  using (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'))
  with check (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'));

-- medios: solo personal. Los derechos de uso se registran en license_reference.
create policy media_staff on public.media_assets for all to authenticated
  using (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'))
  with check (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'));

-- leads: el visitante inserta solo con consentimiento; comercial ve los suyos; admin ve todos.
create policy leads_public_insert on public.leads for insert to anon, authenticated
  with check (consent_at is not null);
create policy leads_commercial_read on public.leads for select to authenticated
  using (public.has_role('admin') or (public.has_role('commercial') and assigned_to = auth.uid()));
create policy leads_commercial_update on public.leads for update to authenticated
  using (public.has_role('admin') or (public.has_role('commercial') and assigned_to = auth.uid()))
  with check (public.has_role('admin') or (public.has_role('commercial') and assigned_to = auth.uid()));

-- knowledge_sources: lectura de personal; escritura publisher/admin (solo fuentes aprobadas se publican).
create policy knowledge_staff_read on public.knowledge_sources for select to authenticated
  using (public.has_role('editor') or public.has_role('publisher') or public.has_role('admin'));
create policy knowledge_publisher_write on public.knowledge_sources for all to authenticated
  using (public.has_role('publisher') or public.has_role('admin'))
  with check (public.has_role('publisher') or public.has_role('admin'));

-- audit_logs: solo admin lee. Sin políticas de escritura para clientes.
create policy audit_admin_read on public.audit_logs for select to authenticated
  using (public.has_role('admin'));

-- roi_scenarios, ai_sessions, ai_messages: sin políticas => ni anon ni authenticated acceden.
-- La pasarela (service role) usa estas tablas; ese rol omite RLS y nunca se expone al navegador.

-- Privilegios explícitos: el público solo lee lo publicado; nada sensible se concede a anon.
revoke all on public.leads, public.roi_scenarios, public.ai_sessions, public.ai_messages,
  public.audit_logs, public.profiles, public.role_assignments, public.media_assets,
  public.knowledge_sources from anon;
grant insert on public.leads to anon;
grant select on public.site_sections, public.site_section_versions, public.blog_posts,
  public.blog_translations to anon;

commit;
