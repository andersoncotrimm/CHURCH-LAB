-- CHURCH-LAB ASSETS — fundação do banco de dados e sistema de créditos
--
-- Modelo comercial: assinatura concede créditos por ciclo (não cumulativos);
-- cada PSD tem um custo em créditos definido pelo administrador; cada
-- download desconta do saldo do ciclo ativo da assinatura.
--
-- Este arquivo não apaga nem sobrescreve nenhuma estrutura existente:
-- todas as instruções usam "if not exists" / "create or replace" / checagens
-- explícitas, e podem ser reexecutadas com segurança (idempotente).

create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. PROFILES
-- =========================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil do núcleo de usuários do CHURCH-LAB (1:1 com auth.users).';

-- =========================================================================
-- 2. PRODUCTS — módulos comercializados pelo CHURCH-LAB
-- =========================================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  product_type text not null check (product_type in ('assets', 'events', 'forms', 'automation', 'other')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'Produtos/módulos do CHURCH-LAB (assets é o primeiro; events/forms/automation ficam reservados para o futuro).';

-- =========================================================================
-- 3. PLANS
-- =========================================================================

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  price numeric(10, 2) not null default 0 check (price >= 0),
  currency text not null default 'BRL',
  billing_interval text not null check (billing_interval in ('monthly', 'yearly')),
  monthly_credits integer not null default 0 check (monthly_credits >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, slug)
);

comment on column public.plans.monthly_credits is 'Créditos concedidos a cada ciclo da assinatura. Não cumulativo entre ciclos.';

-- =========================================================================
-- 4. SUBSCRIPTIONS
-- =========================================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status text not null check (status in ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  next_billing_at timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (current_period_end > current_period_start)
);

comment on table public.subscriptions is 'Assinatura de um usuário a um plano. O ciclo de cobrança é individual (data de início da assinatura), não fixo no dia 1 do mês.';

-- =========================================================================
-- 5. SUBSCRIPTION_CYCLES — ciclo individual de créditos de uma assinatura
-- =========================================================================

create table if not exists public.subscription_cycles (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  credits_granted integer not null check (credits_granted >= 0),
  credits_used integer not null default 0 check (credits_used >= 0),
  status text not null default 'active' check (status in ('active', 'closed', 'expired')),
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  check (period_end > period_start),
  check (credits_used <= credits_granted)
);

comment on table public.subscription_cycles is 'Ciclo de créditos de uma assinatura. credits_granted é fixado no momento da criação do ciclo (baseado no plano vigente) e nunca é alterado retroativamente. Saldo não usado expira ao fechar o ciclo, nunca é transferido.';

-- Garante que uma assinatura nunca tenha dois ciclos ativos simultaneamente.
create unique index if not exists idx_subscription_cycles_one_active_per_subscription
  on public.subscription_cycles (subscription_id)
  where (status = 'active');

-- =========================================================================
-- 6. CATEGORIES
-- =========================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- 7. TAGS
-- =========================================================================

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- 8. PSD_FILES
-- =========================================================================

create table if not exists public.psd_files (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  preview_url text,
  file_path text not null,
  file_size bigint check (file_size is null or file_size >= 0),
  file_format text,
  credit_cost integer not null check (credit_cost >= 0),
  is_published boolean not null default false,
  is_featured boolean not null default false,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.psd_files.credit_cost is 'Custo em créditos definido individualmente pelo administrador no cadastro do arquivo. Não segue regra fixa por categoria.';
comment on column public.psd_files.file_path is 'Referência ao objeto no bucket protegido (Supabase Storage). Entrega via signed URL será implementada em etapa futura.';

-- =========================================================================
-- 9. PSD_CATEGORIES (N:N)
-- =========================================================================

create table if not exists public.psd_categories (
  psd_id uuid not null references public.psd_files (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (psd_id, category_id)
);

-- =========================================================================
-- 10. PSD_TAGS (N:N)
-- =========================================================================

create table if not exists public.psd_tags (
  psd_id uuid not null references public.psd_files (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (psd_id, tag_id)
);

-- =========================================================================
-- 11. FAVORITES
-- =========================================================================

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  psd_id uuid not null references public.psd_files (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, psd_id)
);

-- =========================================================================
-- 12. DOWNLOADS
-- =========================================================================

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  psd_id uuid not null references public.psd_files (id),
  subscription_id uuid not null references public.subscriptions (id),
  subscription_cycle_id uuid not null references public.subscription_cycles (id),
  credits_spent integer not null check (credits_spent >= 0),
  created_at timestamptz not null default now()
);

comment on table public.downloads is 'Registro de cada download: usuário, PSD, assinatura e ciclo vigentes, e créditos consumidos.';

-- =========================================================================
-- 13. CREDIT_TRANSACTIONS — histórico/auditoria, nunca apagado pela aplicação
-- =========================================================================

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subscription_cycle_id uuid not null references public.subscription_cycles (id),
  download_id uuid references public.downloads (id) on delete set null,
  amount integer not null check (amount <> 0),
  transaction_type text not null check (transaction_type in ('grant', 'download', 'adjustment', 'bonus', 'expiration')),
  description text,
  created_at timestamptz not null default now(),
  check (
    (transaction_type in ('grant', 'bonus') and amount > 0)
    or (transaction_type in ('download', 'expiration') and amount < 0)
    or (transaction_type = 'adjustment')
  )
);

comment on table public.credit_transactions is 'Auditoria de movimentação de créditos. Linhas nunca são apagadas pela aplicação.';

-- =========================================================================
-- ÍNDICES
-- =========================================================================
-- profiles.id: já é a chave primária (índice implícito).
-- psd_files.slug, products.slug, categories.slug, tags.slug: já possuem
-- índice implícito via UNIQUE.
-- favorites.user_id: já coberto pela coluna líder do índice UNIQUE (user_id, psd_id).

create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);
create index if not exists idx_subscriptions_status on public.subscriptions (status);

create index if not exists idx_subscription_cycles_subscription_id on public.subscription_cycles (subscription_id);
create index if not exists idx_subscription_cycles_user_id on public.subscription_cycles (user_id);
create index if not exists idx_subscription_cycles_status on public.subscription_cycles (status);
create index if not exists idx_subscription_cycles_period_start on public.subscription_cycles (period_start);
create index if not exists idx_subscription_cycles_period_end on public.subscription_cycles (period_end);

create index if not exists idx_psd_files_is_published on public.psd_files (is_published);
create index if not exists idx_psd_files_created_at on public.psd_files (created_at);

create index if not exists idx_downloads_user_id on public.downloads (user_id);
create index if not exists idx_downloads_psd_id on public.downloads (psd_id);
create index if not exists idx_downloads_subscription_cycle_id on public.downloads (subscription_cycle_id);

create index if not exists idx_credit_transactions_user_id on public.credit_transactions (user_id);
create index if not exists idx_credit_transactions_subscription_cycle_id on public.credit_transactions (subscription_cycle_id);

-- =========================================================================
-- TRIGGERS — updated_at automático
-- =========================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_plans_updated_at on public.plans;
create trigger trg_plans_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_psd_files_updated_at on public.psd_files;
create trigger trg_psd_files_updated_at before update on public.psd_files
  for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- subscription_cycles.updated_at não existe no schema (created_at + closed_at
-- representam seu ciclo de vida), portanto sem trigger de updated_at aqui.

-- =========================================================================
-- TRIGGER — cria profile automaticamente ao registrar um novo usuário
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_cycles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.psd_files enable row level security;
alter table public.psd_categories enable row level security;
alter table public.psd_tags enable row level security;
alter table public.favorites enable row level security;
alter table public.downloads enable row level security;
alter table public.credit_transactions enable row level security;

-- profiles: cada usuário só vê/edita o próprio perfil.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- products / plans: catálogo público (para usuários autenticados) de itens ativos.
-- Escrita reservada a service_role até existir um painel administrativo.
drop policy if exists "Authenticated users can view active products" on public.products;
create policy "Authenticated users can view active products" on public.products
  for select to authenticated using (is_active = true);

drop policy if exists "Authenticated users can view active plans" on public.plans;
create policy "Authenticated users can view active plans" on public.plans
  for select to authenticated using (is_active = true);

-- subscriptions / subscription_cycles: somente o próprio usuário.
-- Escrita feita via service_role / funções SECURITY DEFINER (billing, créditos).
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can view own subscription cycles" on public.subscription_cycles;
create policy "Users can view own subscription cycles" on public.subscription_cycles
  for select to authenticated using (auth.uid() = user_id);

-- categories / tags / relações: taxonomia compartilhada, leitura liberada
-- para autenticados (não é dado privado de usuário).
drop policy if exists "Authenticated users can view categories" on public.categories;
create policy "Authenticated users can view categories" on public.categories
  for select to authenticated using (true);

drop policy if exists "Authenticated users can view tags" on public.tags;
create policy "Authenticated users can view tags" on public.tags
  for select to authenticated using (true);

drop policy if exists "Authenticated users can view psd categories" on public.psd_categories;
create policy "Authenticated users can view psd categories" on public.psd_categories
  for select to authenticated using (true);

drop policy if exists "Authenticated users can view psd tags" on public.psd_tags;
create policy "Authenticated users can view psd tags" on public.psd_tags
  for select to authenticated using (true);

-- psd_files: usuários autenticados só veem arquivos publicados.
drop policy if exists "Authenticated users can view published psd files" on public.psd_files;
create policy "Authenticated users can view published psd files" on public.psd_files
  for select to authenticated using (is_published = true);

-- favorites: CRUD restrito ao próprio usuário (sem update: só existe/não existe).
drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites" on public.favorites
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can add own favorites" on public.favorites;
create policy "Users can add own favorites" on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can remove own favorites" on public.favorites;
create policy "Users can remove own favorites" on public.favorites
  for delete to authenticated using (auth.uid() = user_id);

-- downloads / credit_transactions: leitura do próprio histórico apenas.
-- Escrita só acontece via public.redeem_psd_credits (SECURITY DEFINER) ou service_role.
drop policy if exists "Users can view own downloads" on public.downloads;
create policy "Users can view own downloads" on public.downloads
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can view own credit transactions" on public.credit_transactions;
create policy "Users can view own credit transactions" on public.credit_transactions
  for select to authenticated using (auth.uid() = user_id);

-- NOTA: políticas de gestão administrativa (criar/editar PSDs, categorias,
-- planos, encerrar assinaturas de terceiros etc.) ficam para uma etapa
-- futura, quando existir um papel de administrador definido. Por ora, essas
-- operações só são possíveis via service_role (que contorna RLS), nunca
-- pelo cliente autenticado comum — por isso nenhuma policy de
-- insert/update/delete foi criada para "authenticated" nessas tabelas.

-- =========================================================================
-- FUNÇÕES — regra central de consumo de créditos e ciclo de vida do ciclo
-- =========================================================================

-- Inicia um novo ciclo de créditos para uma assinatura, usando o
-- monthly_credits do plano vigente NO MOMENTO da chamada (upgrades/downgrades
-- não alteram ciclos já fechados). Cria a transação de auditoria "grant".
create or replace function public.start_subscription_cycle(
  p_subscription_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
returns public.subscription_cycles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_credits integer;
  v_cycle public.subscription_cycles;
begin
  select s.user_id, p.monthly_credits
    into v_user_id, v_credits
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.id = p_subscription_id;

  if not found then
    raise exception 'subscription_not_found' using errcode = 'P0002';
  end if;

  insert into public.subscription_cycles (
    subscription_id, user_id, period_start, period_end, credits_granted, credits_used, status
  )
  values (p_subscription_id, v_user_id, p_period_start, p_period_end, v_credits, 0, 'active')
  returning * into v_cycle;

  insert into public.credit_transactions (user_id, subscription_cycle_id, amount, transaction_type, description)
  values (v_user_id, v_cycle.id, v_credits, 'grant', 'Créditos concedidos para o novo ciclo');

  return v_cycle;
end;
$$;

revoke execute on function public.start_subscription_cycle(uuid, timestamptz, timestamptz) from public;
grant execute on function public.start_subscription_cycle(uuid, timestamptz, timestamptz) to service_role;

-- Fecha um ciclo ativo: o saldo não utilizado expira (transação "expiration"
-- com amount negativo) e NUNCA é transferido para o próximo ciclo.
create or replace function public.expire_subscription_cycle(p_cycle_id uuid)
returns public.subscription_cycles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cycle public.subscription_cycles;
  v_remaining integer;
begin
  select * into v_cycle from public.subscription_cycles where id = p_cycle_id for update;

  if not found then
    raise exception 'cycle_not_found' using errcode = 'P0002';
  end if;

  if v_cycle.status <> 'active' then
    raise exception 'cycle_not_active' using errcode = 'P0001';
  end if;

  v_remaining := v_cycle.credits_granted - v_cycle.credits_used;

  if v_remaining > 0 then
    insert into public.credit_transactions (user_id, subscription_cycle_id, amount, transaction_type, description)
    values (v_cycle.user_id, v_cycle.id, -v_remaining, 'expiration', 'Créditos não utilizados expiraram ao final do ciclo');
  end if;

  update public.subscription_cycles
  set status = 'closed', closed_at = now()
  where id = v_cycle.id
  returning * into v_cycle;

  return v_cycle;
end;
$$;

revoke execute on function public.expire_subscription_cycle(uuid) from public;
grant execute on function public.expire_subscription_cycle(uuid) to service_role;

-- Regra central de consumo: valida autenticação, assinatura ativa, ciclo
-- ativo e saldo suficiente; se ok, desconta créditos, registra o download
-- e a transação de auditoria — tudo atomicamente (com lock de linha no
-- ciclo para evitar condição de corrida em downloads simultâneos).
create or replace function public.redeem_psd_credits(p_psd_id uuid)
returns public.downloads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_psd public.psd_files;
  v_subscription public.subscriptions;
  v_cycle public.subscription_cycles;
  v_available integer;
  v_download public.downloads;
begin
  if v_user_id is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_psd from public.psd_files where id = p_psd_id and is_published = true;
  if not found then
    raise exception 'psd_not_found_or_unpublished' using errcode = 'P0002';
  end if;

  select * into v_subscription
  from public.subscriptions
  where user_id = v_user_id and status = 'active'
  order by created_at desc
  limit 1;

  if not found then
    raise exception 'no_active_subscription' using errcode = 'P0001';
  end if;

  select * into v_cycle
  from public.subscription_cycles
  where subscription_id = v_subscription.id and status = 'active'
  for update;

  if not found then
    raise exception 'no_active_cycle' using errcode = 'P0001';
  end if;

  v_available := v_cycle.credits_granted - v_cycle.credits_used;

  if v_available < v_psd.credit_cost then
    raise exception 'insufficient_credits' using errcode = 'P0001',
      detail = format('available=%s required=%s', v_available, v_psd.credit_cost);
  end if;

  update public.subscription_cycles
  set credits_used = credits_used + v_psd.credit_cost
  where id = v_cycle.id;

  insert into public.downloads (user_id, psd_id, subscription_id, subscription_cycle_id, credits_spent)
  values (v_user_id, v_psd.id, v_subscription.id, v_cycle.id, v_psd.credit_cost)
  returning * into v_download;

  if v_psd.credit_cost > 0 then
    insert into public.credit_transactions (user_id, subscription_cycle_id, download_id, amount, transaction_type, description)
    values (v_user_id, v_cycle.id, v_download.id, -v_psd.credit_cost, 'download', 'Download: ' || v_psd.title);
  end if;

  return v_download;
end;
$$;

revoke execute on function public.redeem_psd_credits(uuid) from public;
grant execute on function public.redeem_psd_credits(uuid) to authenticated;

-- =========================================================================
-- STORAGE — buckets separados (thumbnail / preview / arquivo original)
-- =========================================================================
-- O arquivo PSD original nunca fica em bucket público. A entrega via signed
-- URL (validando assinatura + créditos) fica para uma etapa futura; por ora
-- psd_files.file_path só referencia o objeto protegido.

insert into storage.buckets (id, name, public)
values
  ('psd-thumbnails', 'psd-thumbnails', true),
  ('psd-previews', 'psd-previews', true),
  ('psd-originals', 'psd-originals', false)
on conflict (id) do nothing;

drop policy if exists "Public read access to psd thumbnails" on storage.objects;
create policy "Public read access to psd thumbnails" on storage.objects
  for select to authenticated, anon using (bucket_id = 'psd-thumbnails');

drop policy if exists "Public read access to psd previews" on storage.objects;
create policy "Public read access to psd previews" on storage.objects
  for select to authenticated, anon using (bucket_id = 'psd-previews');

-- Nenhuma policy de leitura para "psd-originals": acesso somente via
-- service_role até a implementação do fluxo de signed URL protegido.
