-- CHURCH-LAB — controle admin do efeito de vidro (transparência + tom)
--
-- site_settings ganha duas colunas: o quão transparente fica o "vidro"
-- da barra lateral/cabeçalho (0 = totalmente transparente, 100 = opaco)
-- e se o vidro é claro ou escuro. Migration aditiva, sem BEGIN/COMMIT
-- (mesma convenção das anteriores). Idempotente.

alter table public.site_settings
  add column if not exists glass_opacity smallint not null default 70,
  add column if not exists glass_tint text not null default 'dark';

do $add_checks$ begin
  alter table public.site_settings
    add constraint site_settings_glass_opacity_check check (glass_opacity between 0 and 100);
exception when duplicate_object then null;
end $add_checks$;

do $add_checks2$ begin
  alter table public.site_settings
    add constraint site_settings_glass_tint_check check (glass_tint in ('dark', 'light'));
exception when duplicate_object then null;
end $add_checks2$;

do $chk$ begin raise notice 'controle de vidro (transparência/tom) configurado (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.columns where table_schema='public' and table_name='site_settings' and column_name='glass_opacity') as coluna_opacity,
  (select count(*) from information_schema.columns where table_schema='public' and table_name='site_settings' and column_name='glass_tint') as coluna_tint;
