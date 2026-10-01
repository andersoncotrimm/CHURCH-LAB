-- CHURCH-LAB — histórico de versões/atualizações (página de Segurança do admin)
--
-- Cada linha é uma atualização feita na plataforma: versão, título,
-- descrição do que mudou, status (testado e funcionando / com aviso /
-- com problema) e data. Só admin vê e mexe — é informação operacional,
-- não conteúdo público.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

create table if not exists public.platform_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  title text not null,
  description text,
  status text not null default 'ok' check (status in ('ok', 'warning', 'error')),
  released_at timestamptz not null default now()
);

create index if not exists platform_versions_released_at_idx on public.platform_versions (released_at desc);

alter table public.platform_versions enable row level security;

drop policy if exists "Admins can view platform versions" on public.platform_versions;
create policy "Admins can view platform versions" on public.platform_versions
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can insert platform versions" on public.platform_versions;
create policy "Admins can insert platform versions" on public.platform_versions
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can delete platform versions" on public.platform_versions;
create policy "Admins can delete platform versions" on public.platform_versions
  for delete to authenticated using (public.is_admin());

do $chk$ begin raise notice 'platform_versions criada com RLS (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'platform_versions') as tabela_criada,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'platform_versions') as policies_criadas;
