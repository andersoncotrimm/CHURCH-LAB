-- CHURCH-LAB — admin concede plano/créditos manualmente (sem checkout)
--
-- Migration ADITIVA: nenhuma tabela nova, nenhuma exclusão. Três funções
-- SECURITY DEFINER novas, todas com verificação de public.is_admin() NO
-- CORPO da função (não dependem só de GRANT/REVOKE pra bloquear acesso —
-- lição da migration anterior, 20260922220000). EXECUTE é concedido a
-- "authenticated" porque a própria função barra quem não é admin.
--
-- Não existe checkout/pagamento neste momento (fica para integração
-- futura, ex.: Stripe). Isso dá ao admin um jeito de ativar um plano pra
-- um usuário na mão, pra poder testar o fluxo completo (dashboard,
-- créditos, download) sem depender de billing real.
--
-- O QUE ESTE ARQUIVO FAZ:
-- 1. admin_list_users() — lista usuários (auth.users) com plano/créditos
--    atuais, sem expor auth.users direto via PostgREST (que não é exposto
--    por padrão) nem precisar de service_role no app.
-- 2. admin_grant_subscription(user, plano, dias) — ativa (ou substitui) a
--    assinatura do usuário e inicia um ciclo novo de créditos.
-- 3. admin_set_user_admin(user, is_admin) — promove/rebaixa admin, com
--    proteção pra não permitir que o admin remova o próprio acesso.

-- =========================================================================
-- 1. admin_list_users()
-- =========================================================================

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  created_at timestamptz,
  plan_name text,
  credits_available integer,
  subscription_status text
)
language plpgsql
security definer
set search_path = public
as $admin_list_users$
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    u.email::text,
    p.full_name,
    p.is_admin,
    u.created_at,
    pl.name as plan_name,
    case when sc.id is not null then sc.credits_granted - sc.credits_used else null end as credits_available,
    s.status as subscription_status
  from auth.users u
  join public.profiles p on p.id = u.id
  left join lateral (
    select * from public.subscriptions s2
    where s2.user_id = u.id and s2.status = 'active'
    order by s2.created_at desc
    limit 1
  ) s on true
  left join public.plans pl on pl.id = s.plan_id
  left join public.subscription_cycles sc on sc.subscription_id = s.id and sc.status = 'active'
  order by u.created_at desc;
end;
$admin_list_users$;

revoke execute on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

do $chk1$ begin raise notice 'checkpoint 1/3: admin_list_users() criada.'; end $chk1$;

-- =========================================================================
-- 2. admin_grant_subscription(user, plano, dias)
-- =========================================================================

create or replace function public.admin_grant_subscription(
  p_user_id uuid,
  p_plan_id uuid,
  p_period_days integer default 30
)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $admin_grant_subscription$
declare
  v_subscription public.subscriptions;
  v_active_cycle public.subscription_cycles;
  v_period_start timestamptz := now();
  v_period_end timestamptz := now() + make_interval(days => p_period_days);
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  if p_period_days is null or p_period_days <= 0 then
    raise exception 'invalid_period_days' using errcode = '22023';
  end if;

  if not exists (select 1 from public.plans where id = p_plan_id) then
    raise exception 'plan_not_found' using errcode = 'P0002';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  select * into v_subscription
  from public.subscriptions
  where user_id = p_user_id and status = 'active'
  order by created_at desc
  limit 1;

  if found then
    update public.subscriptions
    set plan_id = p_plan_id,
        current_period_start = v_period_start,
        current_period_end = v_period_end,
        cancel_at_period_end = false,
        updated_at = now()
    where id = v_subscription.id
    returning * into v_subscription;

    select * into v_active_cycle
    from public.subscription_cycles
    where subscription_id = v_subscription.id and status = 'active'
    for update;

    if found then
      perform public.expire_subscription_cycle(v_active_cycle.id);
    end if;
  else
    insert into public.subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
    values (p_user_id, p_plan_id, 'active', v_period_start, v_period_end)
    returning * into v_subscription;
  end if;

  perform public.start_subscription_cycle(v_subscription.id, v_period_start, v_period_end);

  return v_subscription;
end;
$admin_grant_subscription$;

revoke execute on function public.admin_grant_subscription(uuid, uuid, integer) from public, anon;
grant execute on function public.admin_grant_subscription(uuid, uuid, integer) to authenticated;

do $chk2$ begin raise notice 'checkpoint 2/3: admin_grant_subscription() criada.'; end $chk2$;

-- =========================================================================
-- 3. admin_set_user_admin(user, is_admin)
-- =========================================================================

create or replace function public.admin_set_user_admin(p_user_id uuid, p_is_admin boolean)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $admin_set_user_admin$
declare
  v_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() and not p_is_admin then
    raise exception 'cannot_remove_self_admin' using errcode = 'P0001';
  end if;

  update public.profiles
  set is_admin = p_is_admin
  where id = p_user_id
  returning * into v_profile;

  if not found then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  return v_profile;
end;
$admin_set_user_admin$;

revoke execute on function public.admin_set_user_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_set_user_admin(uuid, boolean) to authenticated;

do $chk3$ begin raise notice 'checkpoint 3/3: admin_set_user_admin() criada.'; end $chk3$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.routines
     where routine_schema = 'public' and routine_name = 'admin_list_users') as admin_list_users_criada,
  (select count(*) from information_schema.routines
     where routine_schema = 'public' and routine_name = 'admin_grant_subscription') as admin_grant_subscription_criada,
  (select count(*) from information_schema.routines
     where routine_schema = 'public' and routine_name = 'admin_set_user_admin') as admin_set_user_admin_criada,
  1 as esperado_cada;
