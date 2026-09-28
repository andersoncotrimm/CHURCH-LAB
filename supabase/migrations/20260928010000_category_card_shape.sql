-- CHURCH-LAB — formato do card por categoria (quadrado, vertical, horizontal)
--
-- O admin escolhe, ao criar/editar uma categoria, qual proporção os cards
-- de PSD dessa categoria usam na grade pública. "Quadrado" é o valor
-- padrão e corresponde à proporção que já existia antes desta migration
-- (nenhum card muda de aparência sem o admin escolher explicitamente).
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.categories
  add column if not exists card_shape text not null default 'square';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_card_shape_check'
  ) then
    alter table public.categories
      add constraint categories_card_shape_check
      check (card_shape in ('square', 'vertical', 'horizontal'));
  end if;
end $$;

do $chk$ begin raise notice 'card_shape adicionada em categories (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'categories' and column_name = 'card_shape') as coluna_criada;
