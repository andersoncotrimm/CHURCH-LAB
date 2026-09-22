-- CHURCH-LAB — categorias iniciais da biblioteca de PSDs
--
-- Migration ADITIVA de dados: nenhuma tabela nova, nenhuma alteração de
-- estrutura. Apenas insere linhas iniciais e EDITÁVEIS na tabela
-- public.categories já existente (o admin poderá renomear, remover ou
-- criar novas categorias em /admin/categorias — nada disso fica fixo
-- no frontend). Idempotente via "on conflict (slug) do nothing".

insert into public.categories (name, slug, description)
values
  ('Igreja', 'igreja', 'Materiais gerais para a vida da igreja.'),
  ('Social Media', 'social-media', 'Posts e artes para redes sociais.'),
  ('Eventos', 'eventos', 'Divulgação de eventos e conferências.'),
  ('Stories', 'stories', 'Formato vertical para Stories/Reels.'),
  ('Carrosséis', 'carrosseis', 'Sequências de slides para carrossel.'),
  ('Branding', 'branding', 'Identidade visual e marca.'),
  ('Apresentações', 'apresentacoes', 'Slides para telão e apresentações.'),
  ('Pregações', 'pregacoes', 'Material de apoio para pregações.'),
  ('Conferências', 'conferencias', 'Materiais para conferências e congressos.'),
  ('Jovens', 'jovens', 'Ministério de jovens.'),
  ('Infantil', 'infantil', 'Ministério infantil.'),
  ('Natal', 'natal', 'Época natalina.'),
  ('Páscoa', 'pascoa', 'Época pascal.'),
  ('Outros', 'outros', 'Demais materiais.')
on conflict (slug) do nothing;

do $chk1$ begin raise notice 'checkpoint: categorias iniciais garantidas (idempotente).'; end $chk1$;

select count(*) as categorias_existentes from public.categories;
