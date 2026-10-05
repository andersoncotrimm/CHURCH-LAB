-- CHURCH-LAB — pagamentos automáticos via Mercado Pago
--
-- Duas coisas passam a ser cobradas de verdade, sem precisar do admin
-- liberar na mão:
--   1. Assinatura dos planos (/planos) — cobrança recorrente mensal/anual
--      via "Preapproval" do Mercado Pago.
--   2. Créditos extras avulsos (/meus-creditos) — cobrança única via
--      "Preference" (Checkout Pro) do Mercado Pago.
--
-- O fluxo todo (criar a cobrança, redirecionar pro checkout do Mercado
-- Pago, e processar a confirmação) mora na aplicação (lib/mercadopago.ts +
-- app/api/webhooks/mercadopago/route.ts), que roda com a service_role key
-- (ignora RLS) — por isso as tabelas abaixo não precisam de função
-- SECURITY DEFINER pra serem escritas no webhook, só RLS pra proteger o
-- que o próprio usuário pode ver/criar.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

-- =========================================================================
-- 1. CREDIT_PURCHASES — compra avulsa de créditos extras
-- =========================================================================

create table if not exists public.credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  credit_package_id uuid references public.credit_packages (id) on delete set null,
  credits_amount integer not null check (credits_amount > 0),
  amount numeric(10, 2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  mp_preference_id text,
  mp_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.credit_purchases is 'Compra avulsa de créditos extras via Mercado Pago. status vai de pending -> approved (webhook credita e fecha) ou rejected/cancelled.';

create index if not exists idx_credit_purchases_user_id on public.credit_purchases (user_id);
create index if not exists idx_credit_purchases_status on public.credit_purchases (status);

alter table public.credit_purchases enable row level security;

drop policy if exists "Users can view own credit purchases" on public.credit_purchases;
create policy "Users can view own credit purchases" on public.credit_purchases
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Admins can view all credit purchases" on public.credit_purchases;
create policy "Admins can view all credit purchases" on public.credit_purchases
  for select to authenticated using (public.is_admin());

drop policy if exists "Users can create own pending credit purchase" on public.credit_purchases;
create policy "Users can create own pending credit purchase" on public.credit_purchases
  for insert to authenticated with check (user_id = auth.uid() and status = 'pending');

do $chk1$ begin raise notice 'checkpoint 1/5: credit_purchases criada com RLS.'; end $chk1$;

-- =========================================================================
-- 2. SUBSCRIPTION_CHECKOUTS — tentativa de assinatura (antes de autorizada)
-- =========================================================================

create table if not exists public.subscription_checkouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status text not null default 'pending' check (status in ('pending', 'authorized', 'cancelled')),
  mp_preapproval_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscription_checkouts is 'Tentativa de assinatura via Mercado Pago. Quando o preapproval é autorizado, o webhook cria a linha real em subscriptions + o primeiro ciclo e marca este registro como authorized.';

create index if not exists idx_subscription_checkouts_user_id on public.subscription_checkouts (user_id);

alter table public.subscription_checkouts enable row level security;

drop policy if exists "Users can view own subscription checkouts" on public.subscription_checkouts;
create policy "Users can view own subscription checkouts" on public.subscription_checkouts
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Admins can view all subscription checkouts" on public.subscription_checkouts;
create policy "Admins can view all subscription checkouts" on public.subscription_checkouts
  for select to authenticated using (public.is_admin());

drop policy if exists "Users can create own pending subscription checkout" on public.subscription_checkouts;
create policy "Users can create own pending subscription checkout" on public.subscription_checkouts
  for insert to authenticated with check (user_id = auth.uid() and status = 'pending');

do $chk2$ begin raise notice 'checkpoint 2/5: subscription_checkouts criada com RLS.'; end $chk2$;

-- =========================================================================
-- 3. SUBSCRIPTIONS.mp_preapproval_id — liga a assinatura real ao Mercado Pago
-- =========================================================================

alter table public.subscriptions add column if not exists mp_preapproval_id text unique;

do $chk3$ begin raise notice 'checkpoint 3/5: subscriptions.mp_preapproval_id adicionada.'; end $chk3$;

-- =========================================================================
-- 4. SUBSCRIPTION_RENEWALS — idempotência das cobranças recorrentes
-- =========================================================================
-- Cada cobrança recorrente autorizada (subscription_authorized_payment) só
-- pode abrir um ciclo novo UMA vez — o Mercado Pago pode reenviar a mesma
-- notificação várias vezes. Tabela só acessada pelo webhook (service_role,
-- que ignora RLS), por isso não tem nenhuma policy (ninguém mais enxerga).

create table if not exists public.subscription_renewals (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  mp_payment_id text not null unique,
  created_at timestamptz not null default now()
);

alter table public.subscription_renewals enable row level security;

do $chk4$ begin raise notice 'checkpoint 4/5: subscription_renewals criada com RLS (sem policies).'; end $chk4$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'credit_purchases') as credit_purchases_criada,
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'subscription_checkouts') as subscription_checkouts_criada,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'mp_preapproval_id') as mp_preapproval_id_criada,
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'subscription_renewals') as subscription_renewals_criada;

do $chk5$ begin raise notice 'checkpoint 5/5: verificação final executada.'; end $chk5$;
