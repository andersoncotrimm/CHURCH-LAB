-- CHURCH-LAB — restaura as policies de escrita do admin (psd_files,
-- categories, psd_categories)
--
-- Causa raiz do "clico em salvar e não acontece nada" no admin: a migration
-- 20260922200000_admin_psd_categories_management.sql define essas policies,
-- mas no banco de produção só a policy pública de leitura estava de fato
-- aplicada em psd_files/categories/psd_categories — sem policy de INSERT,
-- o RLS (habilitado nessas tabelas) bloqueia silenciosamente qualquer
-- gravação, inclusive pro admin. Este arquivo reaplica exatamente as
-- mesmas policies (idempotente, drop-if-exists + create) pra garantir que
-- fiquem de fato no banco.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

-- =========================================================================
-- 1. psd_files
-- =========================================================================

drop policy if exists "Admins can view all psd files" on public.psd_files;
create policy "Admins can view all psd files" on public.psd_files
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can insert psd files" on public.psd_files;
create policy "Admins can insert psd files" on public.psd_files
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update psd files" on public.psd_files;
create policy "Admins can update psd files" on public.psd_files
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete psd files" on public.psd_files;
create policy "Admins can delete psd files" on public.psd_files
  for delete to authenticated using (public.is_admin());

-- =========================================================================
-- 2. categories
-- =========================================================================

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories" on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories" on public.categories
  for delete to authenticated using (public.is_admin());

-- =========================================================================
-- 3. psd_categories (vínculo N:N)
-- =========================================================================

drop policy if exists "Admins can insert psd categories" on public.psd_categories;
create policy "Admins can insert psd categories" on public.psd_categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can delete psd categories" on public.psd_categories;
create policy "Admins can delete psd categories" on public.psd_categories
  for delete to authenticated using (public.is_admin());

do $chk$ begin raise notice 'policies de escrita do admin restauradas (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and tablename in ('psd_files', 'categories', 'psd_categories')
order by tablename, cmd;
