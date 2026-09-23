-- CHURCH-LAB — configurações extras do site: tempo do carrossel de
-- destaques e link do board de referências do Pinterest
--
-- Duas colunas novas em site_settings (já existente):
-- 1. carousel_interval_seconds: quanto tempo cada slide do carrossel de
--    destaques (home/dashboard) fica visível antes de avançar sozinho.
-- 2. reference_pinterest_url: link de um board público do Pinterest —
--    a página /referencias busca o RSS público desse board e mostra as
--    imagens dentro da plataforma.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.site_settings
  add column if not exists carousel_interval_seconds integer not null default 7;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_settings_carousel_interval_check'
  ) then
    alter table public.site_settings
      add constraint site_settings_carousel_interval_check
      check (carousel_interval_seconds >= 2 and carousel_interval_seconds <= 60);
  end if;
end $$;

alter table public.site_settings
  add column if not exists reference_pinterest_url text;

do $chk$ begin raise notice 'carousel_interval_seconds e reference_pinterest_url configurados em site_settings (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select site_name, carousel_interval_seconds, reference_pinterest_url from public.site_settings;
