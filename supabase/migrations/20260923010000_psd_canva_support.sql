-- CHURCH-LAB — suporte a materiais editáveis via Canva, além de PSD.
--
-- A partir de agora um psd_files pode ter:
-- 1. Um arquivo PSD original (file_path, como já era);
-- 2. Um link de template Canva (canva_url, novo);
-- 3. Ambos.
-- Pelo menos um dos dois precisa existir (constraint abaixo), por isso
-- file_path deixa de ser NOT NULL.
--
-- slides_count é informativo (ex.: "quantos slides tem esse carrossel"),
-- mostrado no card/modal de detalhes — não afeta a lógica de créditos.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).

alter table public.psd_files
  alter column file_path drop not null;

alter table public.psd_files
  add column if not exists canva_url text,
  add column if not exists slides_count integer;

alter table public.psd_files
  drop constraint if exists psd_files_has_asset;

alter table public.psd_files
  add constraint psd_files_has_asset
  check (file_path is not null or canva_url is not null);

do $chk$ begin raise notice 'suporte a Canva adicionado a psd_files (idempotente).'; end $chk$;
