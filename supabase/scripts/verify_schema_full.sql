-- CHURCH-LAB ASSETS — verificação completa do schema (SOMENTE LEITURA)
-- Nenhum INSERT/UPDATE/DELETE/DDL.
--
-- Uma ÚNICA consulta que resume as 11 verificações numa linha só (o SQL
-- Editor só mostra a grade de resultado do último statement de um script
-- com vários SELECTs — isto evita esse problema). Cole e rode de uma vez.
--
-- Valores esperados (confirmados localmente contra a mesma migration):
-- tabelas_criadas=13  funcoes_criadas=5  tabelas_com_rls=13
-- policies_public=17  indices_public=34  foreign_keys=20
-- triggers_total=7    check_constraints=17
-- indice_ciclo_unico_ok=true
-- buckets_criados=3   storage_policies=2

select
  -- 1) tabelas
  (select count(*) from information_schema.tables
     where table_schema = 'public' and table_name in (
       'profiles','products','plans','subscriptions','subscription_cycles',
       'categories','tags','psd_files','psd_categories','psd_tags',
       'favorites','downloads','credit_transactions'
     )) as tabelas_criadas,
  13 as tabelas_esperadas,

  -- 2) funções
  (select count(*) from information_schema.routines
     where routine_schema = 'public' and routine_name in (
       'set_updated_at','handle_new_user',
       'start_subscription_cycle','expire_subscription_cycle','redeem_psd_credits'
     )) as funcoes_criadas,
  5 as funcoes_esperadas,

  -- 3) RLS habilitado
  (select count(*) from pg_class
     where relnamespace = 'public'::regnamespace and relkind = 'r' and relrowsecurity
       and relname in (
         'profiles','products','plans','subscriptions','subscription_cycles',
         'categories','tags','psd_files','psd_categories','psd_tags',
         'favorites','downloads','credit_transactions'
       )) as tabelas_com_rls,
  13 as tabelas_esperadas_rls,

  -- 4) policies
  (select count(*) from pg_policies where schemaname = 'public') as policies_public,
  17 as policies_esperadas,

  -- 5) índices
  (select count(*) from pg_indexes where schemaname = 'public') as indices_public,
  34 as indices_esperados,

  -- 6) foreign keys
  (select count(*) from information_schema.table_constraints
     where constraint_type = 'FOREIGN KEY' and table_schema = 'public') as foreign_keys,
  20 as foreign_keys_esperadas,

  -- 7) triggers (updated_at x6 + on_auth_user_created)
  (
    (select count(*) from information_schema.triggers where trigger_schema = 'public')
    + (select count(*) from information_schema.triggers
         where trigger_schema = 'auth' and event_object_table = 'users')
  ) as triggers_total,
  7 as triggers_esperados,

  -- 8) check constraints
  (select count(*) from pg_constraint
     where connamespace = 'public'::regnamespace and contype = 'c') as check_constraints,
  17 as check_constraints_esperadas,

  -- 9) índice único que impede 2 ciclos "active" na mesma assinatura
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'idx_subscription_cycles_one_active_per_subscription'
  ) as indice_ciclo_unico_ok,

  -- 10) buckets de storage
  (select count(*) from storage.buckets
     where id in ('psd-thumbnails', 'psd-previews', 'psd-originals')) as buckets_criados,
  3 as buckets_esperados,

  -- 11) policies de storage.objects
  (select count(*) from pg_policies
     where schemaname = 'storage' and tablename = 'objects') as storage_policies,
  2 as storage_policies_esperadas;
