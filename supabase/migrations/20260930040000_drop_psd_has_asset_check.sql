-- CHURCH-LAB — remove a constraint que travava criar um PSD só com nome
--
-- `psd_files_has_asset` exigia file_path OU canva_url preenchido na
-- hora do insert. Isso nunca foi atualizado quando o formulário passou
-- a exigir só o título (admin completa o resto depois, inclusive
-- subindo o arquivo/link num segundo momento) — resultado: "new row for
-- relation psd_files violates check constraint psd_files_has_asset" ao
-- tentar salvar um PSD novo sem arquivo/Canva ainda.
--
-- Migration aditiva (é um DROP, mas idempotente com IF EXISTS), sem
-- BEGIN/COMMIT (mesma convenção das anteriores).

alter table public.psd_files drop constraint if exists psd_files_has_asset;

do $chk$ begin raise notice 'constraint psd_files_has_asset removida (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select count(*) as constraint_ainda_existe
from pg_constraint
where conrelid = 'public.psd_files'::regclass and conname = 'psd_files_has_asset';
