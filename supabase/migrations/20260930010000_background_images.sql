-- CHURCH-LAB — imagem de fundo responsiva (mobile/tablet/desktop)
--
-- site_settings ganha uma URL de imagem de fundo por formato de tela,
-- mais um toggle pra usar a mesma imagem nos três. Bucket público
-- "site-backgrounds" pra guardar os arquivos, com upload restrito a
-- admin (mesmo padrão dos buckets de PSD).
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.site_settings
  add column if not exists background_image_mobile_url text,
  add column if not exists background_image_tablet_url text,
  add column if not exists background_image_desktop_url text,
  add column if not exists background_image_same_for_all boolean not null default true;

insert into storage.buckets (id, name, public)
values ('site-backgrounds', 'site-backgrounds', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to site backgrounds" on storage.objects;
create policy "Public read access to site backgrounds" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-backgrounds');

drop policy if exists "Admins can upload site backgrounds" on storage.objects;
create policy "Admins can upload site backgrounds" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-backgrounds' and public.is_admin());

drop policy if exists "Admins can update site backgrounds" on storage.objects;
create policy "Admins can update site backgrounds" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-backgrounds' and public.is_admin())
  with check (bucket_id = 'site-backgrounds' and public.is_admin());

drop policy if exists "Admins can delete site backgrounds" on storage.objects;
create policy "Admins can delete site backgrounds" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-backgrounds' and public.is_admin());

do $chk$ begin raise notice 'imagens de fundo responsivas configuradas (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.columns where table_schema='public' and table_name='site_settings' and column_name='background_image_desktop_url') as coluna_criada,
  (select count(*) from storage.buckets where id='site-backgrounds') as bucket_criado,
  (select count(*) from pg_policies where schemaname='storage' and tablename='objects' and policyname like '%site backgrounds%') as policies_criadas;
