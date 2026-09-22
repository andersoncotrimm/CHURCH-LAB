-- CHURCH-LAB — acesso público à biblioteca de PSDs + entrega segura do arquivo original
--
-- Migration ADITIVA: nenhuma tabela nova, nenhuma exclusão. Só ajusta
-- policies de leitura (mesmo padrão já usado na migration de planos) e
-- adiciona UMA policy de storage. Sem BEGIN/COMMIT (lição já aprendida
-- nesta série de migrations — ver 20260922160734 e 20260922172443).
--
-- O QUE ESTE ARQUIVO FAZ:
-- 1. Permite que visitantes anônimos (role "anon") leiam psd_files
--    publicados, categories, tags e as tabelas de relacionamento
--    psd_categories/psd_tags — hoje essas policies só liberavam
--    "authenticated", o que impedia a navegação pública pela biblioteca.
-- 2. Adiciona uma policy em storage.objects que permite que um usuário
--    autenticado gere uma signed URL do bucket protegido "psd-originals"
--    APENAS para arquivos que ele já tem registrados em public.downloads
--    (ou seja, que ele já pagou com créditos via redeem_psd_credits()).
--    Isso evita precisar de service_role key no app: a própria RLS
--    garante que só quem pagou consegue gerar o link do arquivo.

-- =========================================================================
-- 1. Leitura pública do catálogo
-- =========================================================================

drop policy if exists "Authenticated users can view published psd files" on public.psd_files;
drop policy if exists "Public can view published psd files" on public.psd_files;
create policy "Public can view published psd files" on public.psd_files
  for select to authenticated, anon using (is_published = true);

drop policy if exists "Authenticated users can view categories" on public.categories;
drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories" on public.categories
  for select to authenticated, anon using (true);

drop policy if exists "Authenticated users can view tags" on public.tags;
drop policy if exists "Public can view tags" on public.tags;
create policy "Public can view tags" on public.tags
  for select to authenticated, anon using (true);

drop policy if exists "Authenticated users can view psd categories" on public.psd_categories;
drop policy if exists "Public can view psd categories" on public.psd_categories;
create policy "Public can view psd categories" on public.psd_categories
  for select to authenticated, anon using (true);

drop policy if exists "Authenticated users can view psd tags" on public.psd_tags;
drop policy if exists "Public can view psd tags" on public.psd_tags;
create policy "Public can view psd tags" on public.psd_tags
  for select to authenticated, anon using (true);

do $chk1$ begin raise notice 'checkpoint 1/2: leitura publica (anon) liberada para psd_files publicados, categories, tags e relacoes.'; end $chk1$;

-- =========================================================================
-- 2. Entrega segura do arquivo original (sem service_role no app)
-- =========================================================================

drop policy if exists "Users can read originals of psd files they downloaded" on storage.objects;
create policy "Users can read originals of psd files they downloaded" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'psd-originals'
    and exists (
      select 1
      from public.downloads d
      join public.psd_files pf on pf.id = d.psd_id
      where pf.file_path = storage.objects.name
        and d.user_id = auth.uid()
    )
  );

do $chk2$ begin raise notice 'checkpoint 2/2: policy de leitura protegida de psd-originals aplicada (somente quem ja pagou pelo arquivo).'; end $chk2$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'psd_files' and 'anon' = any(roles)) as psd_files_anon_policy,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'categories' and 'anon' = any(roles)) as categories_anon_policy,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'tags' and 'anon' = any(roles)) as tags_anon_policy,
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can read originals of psd files they downloaded') as storage_signed_url_policy,
  4 as tudo_deveria_ser_1;
