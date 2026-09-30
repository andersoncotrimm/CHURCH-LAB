-- CHURCH-LAB — seções customizáveis da home (admin escolhe nome + itens)
--
-- home_sections: cada linha é uma fileira que o admin cria pra home/
-- dashboard (nome, ordem, ativa ou não). home_section_items: quais PSDs
-- entram em cada seção e em que ordem.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

create table if not exists public.home_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_section_items (
  section_id uuid not null references public.home_sections(id) on delete cascade,
  psd_id uuid not null references public.psd_files(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (section_id, psd_id)
);

create index if not exists home_section_items_section_idx on public.home_section_items (section_id);

drop trigger if exists trg_home_sections_updated_at on public.home_sections;
create trigger trg_home_sections_updated_at before update on public.home_sections
  for each row execute function public.set_updated_at();

alter table public.home_sections enable row level security;
alter table public.home_section_items enable row level security;

drop policy if exists "Anyone can view active home sections" on public.home_sections;
create policy "Anyone can view active home sections" on public.home_sections
  for select to anon, authenticated using (is_active = true);

drop policy if exists "Admins can view all home sections" on public.home_sections;
create policy "Admins can view all home sections" on public.home_sections
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can insert home sections" on public.home_sections;
create policy "Admins can insert home sections" on public.home_sections
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update home sections" on public.home_sections;
create policy "Admins can update home sections" on public.home_sections
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete home sections" on public.home_sections;
create policy "Admins can delete home sections" on public.home_sections
  for delete to authenticated using (public.is_admin());

drop policy if exists "Anyone can view home section items" on public.home_section_items;
create policy "Anyone can view home section items" on public.home_section_items
  for select to anon, authenticated using (true);

drop policy if exists "Admins can insert home section items" on public.home_section_items;
create policy "Admins can insert home section items" on public.home_section_items
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can delete home section items" on public.home_section_items;
create policy "Admins can delete home section items" on public.home_section_items
  for delete to authenticated using (public.is_admin());

do $chk$ begin raise notice 'home_sections e home_section_items criadas com RLS (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'home_sections') as home_sections_criada,
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'home_section_items') as home_section_items_criada,
  (select count(*) from pg_policies where schemaname = 'public' and tablename in ('home_sections','home_section_items')) as policies_criadas;
