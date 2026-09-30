-- CHURCH-LAB — pacotes de créditos extras (admin configura, exibidos em
-- /meus-creditos como "comprar mais créditos")
--
-- Ainda sem gateway de pagamento integrado (decisão pendente do
-- admin) — por ora isso só mostra os pacotes disponíveis; a compra em
-- si acontece "por fora" (Pix/WhatsApp) e o crédito é adicionado
-- manualmente. site_settings ganha um link de contato opcional pra
-- esse fluxo.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

create table if not exists public.credit_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits_amount integer not null check (credits_amount > 0),
  price numeric(10,2) not null check (price >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_credit_packages_updated_at on public.credit_packages;
create trigger trg_credit_packages_updated_at before update on public.credit_packages
  for each row execute function public.set_updated_at();

alter table public.site_settings add column if not exists contact_url text;

alter table public.credit_packages enable row level security;

drop policy if exists "Anyone can view active credit packages" on public.credit_packages;
create policy "Anyone can view active credit packages" on public.credit_packages
  for select to anon, authenticated using (is_active = true);

drop policy if exists "Admins can view all credit packages" on public.credit_packages;
create policy "Admins can view all credit packages" on public.credit_packages
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can insert credit packages" on public.credit_packages;
create policy "Admins can insert credit packages" on public.credit_packages
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update credit packages" on public.credit_packages;
create policy "Admins can update credit packages" on public.credit_packages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete credit packages" on public.credit_packages;
create policy "Admins can delete credit packages" on public.credit_packages
  for delete to authenticated using (public.is_admin());

do $chk$ begin raise notice 'credit_packages criada com RLS (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'credit_packages') as tabela_criada,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'credit_packages') as policies_criadas,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'contact_url') as coluna_contact_url;
