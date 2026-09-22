-- CHURCH-LAB — gerenciamento de PSDs e categorias pelo Admin
--
-- Migration ADITIVA: nenhuma tabela nova, nenhuma exclusão de estrutura ou
-- dado existente. Só adiciona policies de escrita restritas a admin (via
-- public.is_admin(), já criada na migration de gerenciamento de planos) e
-- policies de storage para o admin poder enviar/atualizar/remover os
-- arquivos dos PSDs (thumbnail, preview e o PSD original). Sem BEGIN/COMMIT
-- (mesma lição das migrations anteriores). Idempotente.
--
-- O QUE ESTE ARQUIVO FAZ:
-- 1. psd_files: admin passa a ver TODOS os arquivos (inclusive não
--    publicados/rascunhos) e ganha insert/update/delete.
-- 2. categories: admin ganha insert/update/delete (leitura pública já
--    existe desde a migration de biblioteca pública).
-- 3. psd_categories: admin ganha insert/delete, para vincular/desvincular
--    categorias a um PSD pelo formulário do admin.
-- 4. storage.objects: admin ganha insert/update/delete nos três buckets de
--    PSD (psd-thumbnails, psd-previews, psd-originals) — a leitura desses
--    buckets já está coberta pelas policies existentes (públicas para
--    thumbnails/previews; via downloads para originals).

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

do $chk1$ begin raise notice 'checkpoint 1/4: policies admin em psd_files aplicadas.'; end $chk1$;

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

do $chk2$ begin raise notice 'checkpoint 2/4: policies admin em categories aplicadas.'; end $chk2$;

-- =========================================================================
-- 3. psd_categories (vínculo N:N)
-- =========================================================================

drop policy if exists "Admins can insert psd categories" on public.psd_categories;
create policy "Admins can insert psd categories" on public.psd_categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can delete psd categories" on public.psd_categories;
create policy "Admins can delete psd categories" on public.psd_categories
  for delete to authenticated using (public.is_admin());

do $chk3$ begin raise notice 'checkpoint 3/4: policies admin em psd_categories aplicadas.'; end $chk3$;

-- =========================================================================
-- 4. storage.objects — upload/edição/remoção dos arquivos pelo admin
-- =========================================================================

drop policy if exists "Admins can upload psd assets" on storage.objects;
create policy "Admins can upload psd assets" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('psd-thumbnails', 'psd-previews', 'psd-originals')
    and public.is_admin()
  );

drop policy if exists "Admins can update psd assets" on storage.objects;
create policy "Admins can update psd assets" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('psd-thumbnails', 'psd-previews', 'psd-originals')
    and public.is_admin()
  )
  with check (
    bucket_id in ('psd-thumbnails', 'psd-previews', 'psd-originals')
    and public.is_admin()
  );

drop policy if exists "Admins can delete psd assets" on storage.objects;
create policy "Admins can delete psd assets" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('psd-thumbnails', 'psd-previews', 'psd-originals')
    and public.is_admin()
  );

do $chk4$ begin raise notice 'checkpoint 4/4: policies admin de upload/update/delete em storage.objects aplicadas.'; end $chk4$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'psd_files' and policyname like 'Admins can%') as psd_files_admin_policies,
  4 as esperado_psd_files,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname like 'Admins can%') as categories_admin_policies,
  3 as esperado_categories,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'psd_categories' and policyname like 'Admins can%') as psd_categories_admin_policies,
  2 as esperado_psd_categories,
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'Admins can%psd assets') as storage_admin_policies,
  3 as esperado_storage;
