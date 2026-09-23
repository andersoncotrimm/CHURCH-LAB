-- CHURCH-LAB — login por nome de usuário (além do e-mail)
--
-- Adiciona um "username" opcional ao perfil. Quem tiver um cadastrado
-- pode digitar ele em vez do e-mail completo na tela de login — o
-- formulário resolve o username pro e-mail real (via a função abaixo)
-- antes de chamar signInWithPassword.
--
-- NOTA DE SEGURANÇA: resolve_login_email() é chamável por "anon" de
-- propósito (login ainda não aconteceu nesse ponto). Ela só devolve o
-- e-mail de contas que EXPLICITAMENTE cadastraram um username (a maioria
-- não terá) — é o mesmo trade-off de qualquer "login por usuário".
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_username_key
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.resolve_login_email(p_username text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username is not null
    and lower(p.username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;

do $chk$ begin raise notice 'login por username configurado (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  has_function_privilege('anon', 'public.resolve_login_email(text)', 'EXECUTE') as anon_pode_chamar,
  (select count(*) from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='username') as coluna_criada;
