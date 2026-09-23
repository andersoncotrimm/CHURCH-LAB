-- CHURCH-LAB — destaque em vídeo (YouTube) para o carrossel da home
--
-- youtube_url é opcional: quando preenchido, o item vira um slide de
-- vídeo no carrossel de destaques em vez de imagem estática. A seleção
-- de "é destaque da semana" continua sendo o campo is_featured já
-- existente (reaproveitado, sem nova coluna).
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.psd_files
  add column if not exists youtube_url text;

do $chk$ begin raise notice 'youtube_url adicionada em psd_files (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'psd_files' and column_name = 'youtube_url') as coluna_criada;
