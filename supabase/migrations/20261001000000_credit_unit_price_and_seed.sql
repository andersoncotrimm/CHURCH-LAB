-- CHURCH-LAB — preço por crédito avulso (quantidade personalizada) + pacotes de exemplo
--
-- site_settings ganha o preço por crédito usado pra calcular o total da
-- opção "quantidade personalizada" em Meus Créditos (terceira opção,
-- ao lado dos pacotes fixos). Também semeia 2 pacotes de exemplo em
-- credit_packages, pra já aparecer algo pronto em /meus-creditos
-- assim que a migration roda (o admin edita/apaga livremente depois
-- em /admin/creditos).
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.site_settings
  add column if not exists credit_unit_price numeric(10,2) not null default 0.50;

insert into public.credit_packages (name, credits_amount, price, sort_order, is_active)
select 'Pacote Bronze', 50, 25.00, 1, true
where not exists (select 1 from public.credit_packages);

insert into public.credit_packages (name, credits_amount, price, sort_order, is_active)
select 'Pacote Prata', 120, 50.00, 2, true
where (select count(*) from public.credit_packages) = 1
  and exists (select 1 from public.credit_packages where name = 'Pacote Bronze');

do $chk$ begin raise notice 'credit_unit_price configurado e pacotes de exemplo semeados (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.columns where table_schema='public' and table_name='site_settings' and column_name='credit_unit_price') as coluna_criada,
  (select count(*) from public.credit_packages) as pacotes_existentes;
