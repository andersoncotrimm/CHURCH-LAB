-- CHURCH-LAB ASSETS — buckets de Storage (thumbnail / preview / arquivo original)
--
-- Depende apenas do schema "storage" nativo do Supabase (não depende de
-- nenhuma tabela criada pela migration 20260922160734). Fica em arquivo
-- separado de propósito: como este é o único trecho que grava em objetos
-- gerenciados pelo Supabase (storage.buckets / storage.objects) em vez de
-- tabelas próprias do schema public, isolá-lo torna qualquer eventual
-- problema de permissão aqui visível sem impedir a criação do schema
-- principal (tabelas, RLS, funções do sistema de créditos).
--
-- O arquivo PSD original nunca fica em bucket público. A entrega via
-- signed URL (validando assinatura + créditos) fica para uma etapa futura;
-- por ora psd_files.file_path só referencia o objeto protegido.
--
-- Idempotente: pode ser reexecutado com segurança.

begin;

insert into storage.buckets (id, name, public)
values
  ('psd-thumbnails', 'psd-thumbnails', true),
  ('psd-previews', 'psd-previews', true),
  ('psd-originals', 'psd-originals', false)
on conflict (id) do nothing;

do $chk1$ begin raise notice 'checkpoint 1/2: buckets psd-thumbnails, psd-previews e psd-originals criados.'; end $chk1$;

drop policy if exists "Public read access to psd thumbnails" on storage.objects;
create policy "Public read access to psd thumbnails" on storage.objects
  for select to authenticated, anon using (bucket_id = 'psd-thumbnails');

drop policy if exists "Public read access to psd previews" on storage.objects;
create policy "Public read access to psd previews" on storage.objects
  for select to authenticated, anon using (bucket_id = 'psd-previews');

-- Nenhuma policy de leitura para "psd-originals": acesso somente via
-- service_role até a implementação do fluxo de signed URL protegido.

do $chk2$ begin raise notice 'checkpoint 2/2: policies de leitura pública para thumbnails/previews aplicadas.'; end $chk2$;
do $chk3$ begin raise notice 'CHURCH-LAB ASSETS: buckets de storage configurados com sucesso.'; end $chk3$;

commit;
