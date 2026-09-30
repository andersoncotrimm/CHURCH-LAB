-- CHURCH-LAB — upload de foto de perfil
--
-- profiles.avatar_url já existia (usado pelo componente Avatar), mas
-- nunca teve de onde vir — não havia bucket nem policy de upload. Cada
-- pessoa só pode escrever dentro da própria pasta (<user_id>/...),
-- leitura pública (mesmo padrão dos buckets de PSD).
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to avatars" on storage.objects;
create policy "Public read access to avatars" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

do $chk$ begin raise notice 'bucket de avatars configurado (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from storage.buckets where id = 'avatars') as bucket_criado,
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like '%avatar%') as policies_criadas;
