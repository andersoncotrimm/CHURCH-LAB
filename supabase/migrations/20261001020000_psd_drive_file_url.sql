-- CHURCH-LAB — PSD guardado no Google Drive do admin (link direto)
--
-- Em vez de subir o arquivo original pro Supabase Storage, o admin
-- pode colar o link de compartilhamento de um arquivo guardado no
-- Google Drive dele (com permissão "Qualquer pessoa com o link pode
-- visualizar"). Quando preenchido, o download do usuário passa a vir
-- desse arquivo — via um proxy do servidor que busca os bytes do
-- Drive e entrega direto pro navegador, sem abrir nenhuma página do
-- Drive (ver app/api/baixar/[psdId]/route.ts).
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.psd_files
  add column if not exists drive_file_url text;

do $chk$ begin raise notice 'drive_file_url configurada em psd_files (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select count(*) as coluna_criada
from information_schema.columns
where table_schema = 'public' and table_name = 'psd_files' and column_name = 'drive_file_url';
