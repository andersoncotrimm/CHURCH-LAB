-- CHURCH-LAB — pagamento via Pix (planos + créditos extras)
--
-- Créditos extras já aceitam Pix automaticamente (o Checkout Pro do
-- Mercado Pago já oferece Pix por padrão) — nada muda no banco pra isso.
--
-- Planos (assinatura) são diferentes: o Mercado Pago só debita
-- automaticamente via CARTÃO. Pix não tem "recorrência" real — cada
-- cobrança exige a pessoa abrir o app do banco e confirmar. Por isso o
-- plano pago via Pix cobra UM ciclo por vez (sem auto-renovar) — a pessoa
-- paga de novo via Pix quando quiser continuar. subscription_checkouts
-- ganha payment_method pra saber qual fluxo usar no webhook.
--
-- Como pagamento por Pix não tem nenhum aviso automático de cancelamento
-- (diferente do cartão, que o Mercado Pago avisa quando falha/é
-- cancelado), redeem_psd_credits() passa a checar também se o ciclo já
-- venceu pela data (period_end), não só pelo status — sem isso, um plano
-- pago via Pix continuaria liberando download pra sempre depois de vencido.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

-- =========================================================================
-- 1. SUBSCRIPTION_CHECKOUTS — payment_method + campos do pagamento Pix
-- =========================================================================

alter table public.subscription_checkouts add column if not exists payment_method text not null default 'card';

do $chk1$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'subscription_checkouts_payment_method_check'
  ) then
    alter table public.subscription_checkouts
      add constraint subscription_checkouts_payment_method_check
      check (payment_method in ('card', 'pix'));
  end if;
end $chk1$;

alter table public.subscription_checkouts add column if not exists mp_preference_id text;
alter table public.subscription_checkouts add column if not exists mp_payment_id text unique;

do $chk2$ begin raise notice 'checkpoint 2/4: subscription_checkouts.payment_method/mp_preference_id/mp_payment_id adicionadas.'; end $chk2$;

-- =========================================================================
-- 2. REDEEM_PSD_CREDITS — fecha o ciclo se já venceu pela data
-- =========================================================================

create or replace function public.redeem_psd_credits(p_psd_id uuid)
returns public.downloads
language plpgsql
security definer
set search_path = public
as $redeem_psd_credits$
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

  -- Ciclo vencido pela data mas ainda marcado "active" (comum em planos
  -- pagos via Pix, que não têm aviso automático de cancelamento) — fecha
  -- aqui mesmo e trata como se não houvesse ciclo ativo.
  if v_cycle.period_end < now() then
    update public.subscription_cycles
    set status = 'expired', closed_at = now()
    where id = v_cycle.id;
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
$redeem_psd_credits$;

revoke execute on function public.redeem_psd_credits(uuid) from public;
grant execute on function public.redeem_psd_credits(uuid) to authenticated;

do $chk3$ begin raise notice 'checkpoint 3/4: redeem_psd_credits() atualizada com checagem de vencimento por data.'; end $chk3$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'subscription_checkouts' and column_name = 'payment_method') as payment_method_criada,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'subscription_checkouts' and column_name = 'mp_payment_id') as mp_payment_id_criada,
  (select count(*) from pg_proc where proname = 'redeem_psd_credits') as funcao_existe;

do $chk4$ begin raise notice 'checkpoint 4/4: verificação final executada.'; end $chk4$;
