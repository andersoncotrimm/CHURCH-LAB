-- CHURCH-LAB — restaura as policies de escrita do admin em storage.objects
-- (buckets psd-thumbnails, psd-previews, psd-originals)
--
-- Mesmo problema da migration 20260923060000_restore_admin_write_policies:
-- a migration 20260922200000_admin_psd_categories_management.sql define
-- essas policies de storage, mas só as de leitura pública estavam de fato
-- aplicadas no banco — sem policy de INSERT, o upload de thumbnail/preview/
-- PSD original pelo admin era bloqueado pelo RLS ("new row violates
-- row-level security policy" ao anexar uma imagem de capa no formulário
-- de PSD). Já apliquei essa correção direto no banco de produção; este
-- arquivo só guarda a migration no histórico do repositório.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

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

do $chk$ begin raise notice 'policies de upload do admin em storage.objects restauradas (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by cmd, policyname;
