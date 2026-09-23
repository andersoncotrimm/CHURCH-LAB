-- CHURCH-LAB — extensões do painel de administrador
--
-- Três peças independentes, todas aditivas e idempotentes:
--
-- 1) site_settings: linha única (id fixo) com nome da plataforma e cores
--    (fundo e botão, separadas), editável em /admin/configuracoes e lida
--    por qualquer visitante para renderizar o tema.
-- 2) filter_types: filtros de tipo de arquivo (hoje PSD/Canva, fixos no
--    código) viram administráveis — admin pode adicionar/remover.
-- 3) content_type em psd_files: segmenta os arquivos entre PSD e as
--    seções hoje desabilitadas no menu (Elementos, Plugins, Ferramentas,
--    Sistemas), permitindo publicar itens nelas.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

-- =========================================================================
-- 1) site_settings
-- =========================================================================

create table if not exists public.site_settings (
  id boolean primary key default true,
  site_name text not null default 'CHURCH-LAB',
  background_color text not null default '#0a0a0c',
  button_color text not null default '#e60a15',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id)
);

insert into public.site_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Anyone can view site settings" on public.site_settings;
create policy "Anyone can view site settings" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- =========================================================================
-- 2) filter_types
-- =========================================================================

create table if not exists public.filter_types (
  id uuid primary key default gen_random_uuid(),
  value text not null unique,
  label text not null,
  icon text not null default 'Layers',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.filter_types (value, label, icon, sort_order)
values
  ('psd', 'PSD', 'FileImage', 1),
  ('canva', 'Canva', 'Palette', 2)
on conflict (value) do nothing;

alter table public.filter_types enable row level security;

drop policy if exists "Anyone can view active filter types" on public.filter_types;
create policy "Anyone can view active filter types" on public.filter_types
  for select to anon, authenticated using (true);

drop policy if exists "Admins can insert filter types" on public.filter_types;
create policy "Admins can insert filter types" on public.filter_types
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update filter types" on public.filter_types;
create policy "Admins can update filter types" on public.filter_types
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete filter types" on public.filter_types;
create policy "Admins can delete filter types" on public.filter_types
  for delete to authenticated using (public.is_admin());

-- =========================================================================
-- 3) content_type em psd_files
-- =========================================================================

alter table public.psd_files
  add column if not exists content_type text not null default 'psd';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'psd_files_content_type_check'
  ) then
    alter table public.psd_files
      add constraint psd_files_content_type_check
      check (content_type in ('psd', 'elementos', 'plugins', 'ferramentas', 'sistemas'));
  end if;
end $$;

create index if not exists psd_files_content_type_idx on public.psd_files (content_type);

do $chk$ begin raise notice 'site_settings, filter_types e content_type configurados (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from public.site_settings) as site_settings_rows,
  1 as esperado,
  (select count(*) from public.filter_types) as filter_types_rows,
  2 as esperado_min,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'psd_files' and column_name = 'content_type') as content_type_criado;
