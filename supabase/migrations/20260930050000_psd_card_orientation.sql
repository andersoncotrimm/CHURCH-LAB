-- CHURCH-LAB — formato do card por PSD (telão/horizontal ou vertical)
--
-- Até aqui o formato do card (quadrado/vertical/horizontal) só vinha da
-- categoria. Pedido do admin: escolher por PSD também — ex. "cards de
-- telão" (horizontais, tipo slide de projeção) misturados numa
-- categoria que por padrão é de outro formato. Nulo = mantém o
-- comportamento atual (usa o formato da categoria).
--
-- Migration aditiva, sem BEGIN/COMMIT (mesma convenção das anteriores).
-- Idempotente.

alter table public.psd_files
  add column if not exists card_orientation text;

do $add_check$ begin
  alter table public.psd_files
    add constraint psd_files_card_orientation_check check (card_orientation in ('vertical', 'horizontal'));
exception when duplicate_object then null;
end $add_check$;

do $chk$ begin raise notice 'card_orientation configurada em psd_files (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select count(*) as coluna_criada
from information_schema.columns
where table_schema = 'public' and table_name = 'psd_files' and column_name = 'card_orientation';
