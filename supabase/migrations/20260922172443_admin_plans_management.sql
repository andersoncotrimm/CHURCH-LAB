-- CHURCH-LAB — gerenciamento de planos pelo Admin
--
-- Migration ADITIVA: não recria nem apaga nenhuma tabela existente. Só
-- adiciona colunas novas (com DEFAULT, então linhas existentes continuam
-- válidas), uma função, novas policies e dados iniciais editáveis.
-- Sem BEGIN/COMMIT (mesma lição da migration anterior). Idempotente.
--
-- O QUE ESTE ARQUIVO FAZ, EM ORDEM:
-- 1. Adiciona a public.plans: benefits, limits, display_order, is_featured.
-- 2. Adiciona a public.profiles: is_admin (novo usuário nasce is_admin=false).
-- 3. Cria a função public.is_admin() — verifica se o usuário logado é admin.
-- 4. Adiciona policies de INSERT/UPDATE/DELETE em plans só para admins
--    (usuário comum continua sem poder escrever, como já era).
-- 5. TROCA a policy de leitura de plans: antes só "authenticated" via
--    is_active=true; agora "anon" também, porque a página pública de
--    planos precisa ser vista por quem NÃO está logado. Isso é uma
--    ampliação de acesso de LEITURA a dados já públicos por natureza
--    (preço, nome, créditos do plano) — nenhum dado privado envolvido.
--    Além disso, adiciona uma segunda policy: admin vê TODOS os planos
--    (inclusive inativos) para poder gerenciá-los.
-- 6. Cria o produto "CHURCH-LAB ASSETS" caso ainda não exista (idempotente).
-- 7. Cria os planos Starter, Pro e Premium como DADOS (linhas editáveis
--    pelo Admin), não como valores fixos no código — só se ainda não
--    existir nenhum plano com esse slug.
-- 8. Verificação final: mostra em uma linha se tudo foi aplicado.

-- =========================================================================
-- 1. plans — novas colunas
-- =========================================================================

alter table public.plans
  add column if not exists benefits jsonb not null default '[]'::jsonb,
  add column if not exists limits jsonb not null default '{}'::jsonb,
  add column if not exists display_order integer not null default 0,
  add column if not exists is_featured boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.plans'::regclass and conname = 'plans_display_order_check'
  ) then
    alter table public.plans add constraint plans_display_order_check check (display_order >= 0);
  end if;
end $$;

comment on column public.plans.benefits is 'Lista de benefícios exibidos publicamente, ex.: ["Downloads ilimitados de previews", "Suporte prioritário"]. Editável pelo Admin.';
comment on column public.plans.limits is 'Limites adicionais do plano, formato livre (ex.: {"max_downloads_per_day": 10}). Editável pelo Admin, opcional.';
comment on column public.plans.display_order is 'Ordem de exibição na página pública de planos (menor primeiro).';
comment on column public.plans.is_featured is 'Marca o plano em destaque na página pública.';

do $chk1$ begin raise notice 'checkpoint 1/8: colunas benefits, limits, display_order, is_featured adicionadas a plans.'; end $chk1$;

-- =========================================================================
-- 2. profiles — quem é admin
-- =========================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is 'Controla acesso ao painel /admin. Precisa ser promovido manualmente (ver instruções de aplicação da migration) — não existe autopromoção.';

do $chk2$ begin raise notice 'checkpoint 2/8: coluna is_admin adicionada a profiles.'; end $chk2$;

-- =========================================================================
-- 3. função is_admin() — usada pelas policies abaixo
-- =========================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $is_admin$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$is_admin$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

do $chk3$ begin raise notice 'checkpoint 3/8: função is_admin() criada.'; end $chk3$;

-- =========================================================================
-- 4 e 5. policies de plans — leitura pública + escrita só para admin
-- =========================================================================

-- Substitui a policy antiga (só "authenticated") por uma que também
-- inclui "anon", para a página pública de planos funcionar sem login.
drop policy if exists "Authenticated users can view active plans" on public.plans;
drop policy if exists "Public can view active plans" on public.plans;
create policy "Public can view active plans" on public.plans
  for select to authenticated, anon using (is_active = true);

-- Admin vê todos os planos, inclusive inativos (para poder gerenciá-los).
drop policy if exists "Admins can view all plans" on public.plans;
create policy "Admins can view all plans" on public.plans
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can insert plans" on public.plans;
create policy "Admins can insert plans" on public.plans
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update plans" on public.plans;
create policy "Admins can update plans" on public.plans
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete plans" on public.plans;
create policy "Admins can delete plans" on public.plans
  for delete to authenticated using (public.is_admin());

do $chk4$ begin raise notice 'checkpoint 4/8: policies de leitura publica e escrita admin aplicadas em plans.'; end $chk4$;

-- =========================================================================
-- 6. produto CHURCH-LAB ASSETS (idempotente)
-- =========================================================================

insert into public.products (name, slug, description, product_type, is_active)
values (
  'CHURCH-LAB ASSETS',
  'church-lab-assets',
  'Biblioteca de recursos gráficos (PSDs) para igrejas e equipes de comunicação.',
  'assets',
  true
)
on conflict (slug) do nothing;

do $chk5$ begin raise notice 'checkpoint 5/8: produto church-lab-assets garantido.'; end $chk5$;

-- =========================================================================
-- 7. planos iniciais — Starter, Pro, Premium (dados editáveis, não código)
-- =========================================================================

insert into public.plans (
  product_id, name, slug, description, price, currency, billing_interval,
  monthly_credits, benefits, limits, display_order, is_featured, is_active
)
select
  (select id from public.products where slug = 'church-lab-assets'),
  v.name, v.slug, v.description, v.price, 'BRL', 'monthly',
  v.monthly_credits, v.benefits::jsonb, '{}'::jsonb, v.display_order, v.is_featured, true
from (
  values
    (
      'Starter', 'starter',
      'Para quem está começando a organizar a comunicação da igreja.',
      29.90, 50,
      '["50 créditos por mês", "Acesso à biblioteca completa de PSDs", "Suporte por e-mail"]',
      1, false
    ),
    (
      'Pro', 'pro',
      'Para equipes de comunicação com produção recorrente de conteúdo.',
      59.90, 100,
      '["100 créditos por mês", "Acesso à biblioteca completa de PSDs", "Suporte prioritário", "Novidades em primeira mão"]',
      2, true
    ),
    (
      'Premium', 'premium',
      'Para igrejas com múltiplos ministérios e alta demanda de materiais.',
      99.90, 250,
      '["250 créditos por mês", "Acesso à biblioteca completa de PSDs", "Suporte prioritário", "Novidades em primeira mão", "Atendimento dedicado"]',
      3, false
    )
) as v(name, slug, description, price, monthly_credits, benefits, display_order, is_featured)
where not exists (
  select 1 from public.plans existing
  where existing.product_id = (select id from public.products where slug = 'church-lab-assets')
    and existing.slug = v.slug
);

do $chk6$ begin raise notice 'checkpoint 6/8: planos iniciais (Starter, Pro, Premium) garantidos.'; end $chk6$;
do $chk7$ begin raise notice 'checkpoint 7/8: nenhum dado ou estrutura existente foi removido.'; end $chk7$;
do $chk8$ begin raise notice 'checkpoint 8/8: migration de gerenciamento de planos aplicada com sucesso.'; end $chk8$;

-- =========================================================================
-- VERIFICAÇÃO FINAL — aparece na grade de resultado do SQL Editor
-- =========================================================================

select
  (select count(*) from information_schema.columns
     where table_schema = 'public' and table_name = 'plans'
       and column_name in ('benefits', 'limits', 'display_order', 'is_featured')) as colunas_novas_em_plans,
  4 as colunas_esperadas,

  (select count(*) from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_admin') as coluna_is_admin_em_profiles,
  1 as coluna_esperada,

  (select count(*) from information_schema.routines
     where routine_schema = 'public' and routine_name = 'is_admin') as funcao_is_admin_criada,
  1 as funcao_esperada,

  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'plans') as policies_em_plans,
  5 as policies_esperadas,

  (select count(*) from public.products where slug = 'church-lab-assets') as produto_assets_existe,
  1 as produto_esperado,

  (select count(*) from public.plans p
     join public.products pr on pr.id = p.product_id
     where pr.slug = 'church-lab-assets' and p.slug in ('starter', 'pro', 'premium')) as planos_iniciais_criados,
  3 as planos_esperados;
