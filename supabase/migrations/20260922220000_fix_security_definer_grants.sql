-- CHURCH-LAB — corrige grants de funções SECURITY DEFINER
--
-- ACHADO DE SEGURANÇA (via Supabase security advisor, aplicado direto no
-- projeto real via MCP em 2026-09-22): as migrations anteriores usaram
-- "revoke execute ... from public", mas o Supabase concede EXECUTE
-- diretamente aos roles anon/authenticated na criação de cada função
-- (não via PUBLIC) — então aquele revoke nunca teve efeito real contra
-- esses dois roles. Resultado real, confirmado com has_function_privilege():
-- qualquer usuário autenticado (e até anônimo) conseguia chamar
-- start_subscription_cycle/expire_subscription_cycle diretamente via REST
-- (/rest/v1/rpc/...) e manipular créditos de QUALQUER assinatura, já que
-- essas funções não conferem quem é o dono do subscription_id/cycle_id
-- recebido como parâmetro.
--
-- Esta migration revoga EXECUTE diretamente dos roles anon/authenticated
-- (e de public, para handle_new_user, que nunca tinha sido revogado desde
-- a primeira migration), que é o que realmente bloqueia o acesso.
-- Idempotente (revoke em privilégio já ausente não é erro).

revoke execute on function public.start_subscription_cycle(uuid, timestamptz, timestamptz) from anon, authenticated;
revoke execute on function public.expire_subscription_cycle(uuid) from anon, authenticated;
revoke execute on function public.redeem_psd_credits(uuid) from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

do $chk$ begin raise notice 'checkpoint: grants de SECURITY DEFINER corrigidos (anon/authenticated bloqueados nas funcoes sensiveis).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  p.proname as function_name,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_pode_executar,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_pode_executar,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_pode_executar
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('redeem_psd_credits', 'start_subscription_cycle', 'expire_subscription_cycle', 'is_admin', 'handle_new_user')
order by p.proname;
