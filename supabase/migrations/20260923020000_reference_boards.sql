-- CHURCH-LAB — coleção de referências visuais (links de pastas do Pinterest)
--
-- Só guarda os links por enquanto: o admin cola o link de uma pasta do
-- Pinterest aqui para consulta futura. Copiar as imagens da pasta
-- automaticamente para a biblioteca é uma feature futura, NÃO implementada
-- nesta migration nem no admin — aqui é só o cadastro/listagem do link.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

create table if not exists public.reference_boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pinterest_url text not null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.reference_boards enable row level security;

drop policy if exists "Admins can view reference boards" on public.reference_boards;
create policy "Admins can view reference boards" on public.reference_boards
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can insert reference boards" on public.reference_boards;
create policy "Admins can insert reference boards" on public.reference_boards
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can delete reference boards" on public.reference_boards;
create policy "Admins can delete reference boards" on public.reference_boards
  for delete to authenticated using (public.is_admin());

do $chk$ begin raise notice 'reference_boards criada com RLS restrita a admin (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'reference_boards') as tabela_criada,
  1 as esperado,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'reference_boards') as policies_criadas,
  3 as esperado_policies;
