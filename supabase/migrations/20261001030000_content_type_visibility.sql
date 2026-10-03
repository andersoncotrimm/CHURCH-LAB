-- CHURCH-LAB — visibilidade das seções (Elementos/Plugins/Ferramentas/
-- Sistemas/PSD) e escolha da página principal.
--
-- O admin passa a poder: (1) ligar/desligar cada seção de conteúdo, o que
-- some com ela do menu lateral e deixa a página dela indisponível
-- publicamente; (2) escolher uma dessas seções pra ser a "página
-- principal" — quem abre a home (/) ou o dashboard (/dashboard) é levado
-- direto pra ela, em vez da home padrão (carrossel + fileiras). Com
-- home_content_type = null, o comportamento continua exatamente como
-- antes desta migration.
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.site_settings
  add column if not exists enabled_content_types text[] not null default array['psd', 'elementos', 'plugins', 'ferramentas', 'sistemas'];

alter table public.site_settings
  add column if not exists home_content_type text;

do $chk$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_settings_home_content_type_check'
  ) then
    alter table public.site_settings
      add constraint site_settings_home_content_type_check
      check (home_content_type is null or home_content_type in ('psd', 'elementos', 'plugins', 'ferramentas', 'sistemas'));
  end if;
end $chk$;

do $chk$ begin raise notice 'enabled_content_types/home_content_type configuradas em site_settings (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'enabled_content_types') as coluna_enabled_criada,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'home_content_type') as coluna_home_criada,
  (select count(*) from pg_constraint where conname = 'site_settings_home_content_type_check') as constraint_criada;
