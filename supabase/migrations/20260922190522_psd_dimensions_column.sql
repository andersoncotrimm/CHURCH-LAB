-- CHURCH-LAB — campo "dimensões" no PSD (exibido na página de detalhes)
--
-- Migration ADITIVA: uma única coluna nova, nullable, em public.psd_files
-- já existente. Nenhuma tabela criada, nenhum dado apagado. O valor é
-- opcional e editável pelo admin no cadastro/edição de cada PSD — nunca
-- inventado no frontend; se estiver vazio, a página de detalhes
-- simplesmente omite essa linha de informação.

alter table public.psd_files
  add column if not exists dimensions text;

comment on column public.psd_files.dimensions is 'Dimensões em pixels, formato livre (ex.: "1080x1350"). Opcional, definido pelo admin.';

do $chk1$ begin raise notice 'checkpoint: coluna dimensions adicionada a psd_files.'; end $chk1$;

select
  (select count(*) from information_schema.columns
     where table_schema = 'public' and table_name = 'psd_files' and column_name = 'dimensions') as coluna_dimensions_existe;
