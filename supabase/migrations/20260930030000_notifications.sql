-- CHURCH-LAB — central de notificações (sino no cabeçalho)
--
-- Tabela simples: cada linha é um aviso ("novo arquivo adicionado em
-- Elementos", "a plataforma foi atualizada"). Nunca guarda o nome do
-- arquivo, só o tipo/categoria (pedido explícito do admin). Leitura
-- pública (todo mundo logado vê o sino), escrita só por admin — as
-- Server Actions que criam PSD/seção já rodam como admin (mesma sessão
-- que passa pelas outras policies de escrita).
--
-- site_settings ganha dois toggles pra admin escolher quais tipos de
-- notificação ficam ativos. Migration aditiva, sem BEGIN/COMMIT (mesma
-- convenção das anteriores). Idempotente.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('new_file', 'platform_update')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.site_settings
  add column if not exists notify_new_files boolean not null default true,
  add column if not exists notify_platform_updates boolean not null default true;

alter table public.notifications enable row level security;

drop policy if exists "Public read access to notifications" on public.notifications;
create policy "Public read access to notifications" on public.notifications
  for select to anon, authenticated
  using (true);

drop policy if exists "Admins can insert notifications" on public.notifications;
create policy "Admins can insert notifications" on public.notifications
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can delete notifications" on public.notifications;
create policy "Admins can delete notifications" on public.notifications
  for delete to authenticated
  using (public.is_admin());

-- Notificação de teste pedida pelo admin, pra já ver o pop-up funcionando.
insert into public.notifications (type, message)
select 'platform_update', 'Bem-vindo à nova central de notificações da plataforma.'
where not exists (select 1 from public.notifications);

do $chk$ begin raise notice 'central de notificações configurada (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.tables where table_schema='public' and table_name='notifications') as tabela_criada,
  (select count(*) from pg_policies where schemaname='public' and tablename='notifications') as policies_criadas,
  (select count(*) from information_schema.columns where table_schema='public' and table_name='site_settings' and column_name='notify_new_files') as coluna_toggle_arquivos,
  (select count(*) from public.notifications) as notificacoes_existentes;
