-- CHURCH-LAB — PSDs de TESTE, só para visualizar a biblioteca com cards populados
--
-- Migration ADITIVA e idempotente (on conflict do nothing), sem BEGIN/COMMIT
-- (mesma lição das migrations anteriores desta série).
--
-- IMPORTANTE — isto é dado de teste, não produto real:
-- 1. As imagens de thumbnail/preview apontam para placehold.co (serviço
--    público de imagem-placeholder), só para os cards não ficarem vazios
--    na tela. Troque por imagens reais depois, editando cada PSD em
--    /admin/psd.
-- 2. file_path aponta para um objeto que NÃO existe de verdade no bucket
--    psd-originals — ninguém subiu um .psd real ainda. Um usuário que
--    tentar baixar um desses itens vai gastar créditos normalmente (o
--    redeem_psd_credits roda igual) mas a geração da signed URL do
--    arquivo original vai falhar, porque o objeto não existe no Storage.
--    Para esses PSDs funcionarem de verdade, edite cada um em /admin/psd
--    e faça upload do arquivo .psd original (aí o file_path é substituído
--    pelo caminho real).
-- 3. Para remover os dados de teste mais tarde, exclua os PSDs marcados
--    aqui direto em /admin/psd (a exclusão só é bloqueada se algum usuário
--    já tiver "baixado" um deles).
--
-- Cada PSD é inserido só se o slug ainda não existir (on conflict do
-- nothing), então rodar esta migration de novo não duplica nada.

with new_psd as (
  insert into public.psd_files (
    title, slug, description, thumbnail_url, preview_url,
    file_path, file_size, file_format, dimensions, credit_cost,
    is_published, is_featured
  )
  values (
    'Kit Stories Culto de Domingo',
    'kit-stories-culto-de-domingo',
    'Kit com 8 artes de Stories para divulgar o culto de domingo, em formato editável.',
    'https://placehold.co/600x750/2a1a4a/c4b5fd?text=Kit+Stories',
    'https://placehold.co/1200x1500/2a1a4a/c4b5fd?text=Kit+Stories',
    'test/kit-stories-culto-de-domingo.psd',
    52428800, 'PSD', '1080x1920px', 40, true, true
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.psd_categories (psd_id, category_id)
select new_psd.id, c.id from new_psd, public.categories c where c.slug in ('stories', 'igreja')
on conflict do nothing;

with new_psd as (
  insert into public.psd_files (
    title, slug, description, thumbnail_url, preview_url,
    file_path, file_size, file_format, dimensions, credit_cost,
    is_published, is_featured
  )
  values (
    'Card Convite Culto de Jovens',
    'card-convite-culto-de-jovens',
    'Card de convite para o culto de jovens, pronto para postar nas redes sociais.',
    'https://placehold.co/600x750/1a2a4a/93c5fd?text=Convite+Jovens',
    'https://placehold.co/1200x1500/1a2a4a/93c5fd?text=Convite+Jovens',
    'test/card-convite-culto-de-jovens.psd',
    18874368, 'PSD', '1080x1080px', 25, true, false
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.psd_categories (psd_id, category_id)
select new_psd.id, c.id from new_psd, public.categories c where c.slug in ('jovens', 'eventos')
on conflict do nothing;

with new_psd as (
  insert into public.psd_files (
    title, slug, description, thumbnail_url, preview_url,
    file_path, file_size, file_format, dimensions, credit_cost,
    is_published, is_featured
  )
  values (
    'Post Aniversário da Igreja',
    'post-aniversario-da-igreja',
    'Post comemorativo para o aniversário da igreja, com espaço para foto e data.',
    'https://placehold.co/600x750/4a1a2a/fca5a5?text=Aniversario',
    'https://placehold.co/1200x1500/4a1a2a/fca5a5?text=Aniversario',
    'test/post-aniversario-da-igreja.psd',
    15728640, 'PSD', '1080x1080px', 15, true, false
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.psd_categories (psd_id, category_id)
select new_psd.id, c.id from new_psd, public.categories c where c.slug in ('social-media', 'igreja')
on conflict do nothing;

with new_psd as (
  insert into public.psd_files (
    title, slug, description, thumbnail_url, preview_url,
    file_path, file_size, file_format, dimensions, credit_cost,
    is_published, is_featured
  )
  values (
    'Kit Natal Completo',
    'kit-natal-completo',
    'Kit completo de Natal: stories, post de feed, card de convite e banner para telão.',
    'https://placehold.co/600x750/1a4a2a/86efac?text=Kit+Natal',
    'https://placehold.co/1200x1500/1a4a2a/86efac?text=Kit+Natal',
    'test/kit-natal-completo.psd',
    104857600, 'PSD', '1080x1920px', 60, true, true
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.psd_categories (psd_id, category_id)
select new_psd.id, c.id from new_psd, public.categories c where c.slug in ('natal')
on conflict do nothing;

with new_psd as (
  insert into public.psd_files (
    title, slug, description, thumbnail_url, preview_url,
    file_path, file_size, file_format, dimensions, credit_cost,
    is_published, is_featured
  )
  values (
    'Carrossel 5 Versículos da Semana',
    'carrossel-5-versiculos-da-semana',
    'Carrossel com 5 slides de versículos para Instagram, layout pronto para trocar o texto.',
    'https://placehold.co/600x750/4a3a1a/fde047?text=Carrossel',
    'https://placehold.co/1200x1500/4a3a1a/fde047?text=Carrossel',
    'test/carrossel-5-versiculos-da-semana.psd',
    31457280, 'PSD', '1080x1350px', 30, true, false
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.psd_categories (psd_id, category_id)
select new_psd.id, c.id from new_psd, public.categories c where c.slug in ('carrosseis')
on conflict do nothing;

with new_psd as (
  insert into public.psd_files (
    title, slug, description, thumbnail_url, preview_url,
    file_path, file_size, file_format, dimensions, credit_cost,
    is_published, is_featured
  )
  values (
    'Slide Apresentação de Cultos',
    'slide-apresentacao-de-cultos',
    'Template de slide para telão, usado durante a apresentação do culto.',
    'https://placehold.co/600x750/3a1a4a/d8b4fe?text=Slide+Culto',
    'https://placehold.co/1200x1500/3a1a4a/d8b4fe?text=Slide+Culto',
    'test/slide-apresentacao-de-cultos.psd',
    26214400, 'PSD', '1920x1080px', 20, true, false
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.psd_categories (psd_id, category_id)
select new_psd.id, c.id from new_psd, public.categories c where c.slug in ('apresentacoes')
on conflict do nothing;

do $chk$ begin raise notice 'seed de PSDs de teste aplicado (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select
  count(*) as psds_de_teste_encontrados,
  6 as esperado,
  array_agg(slug order by slug) as slugs
from public.psd_files
where slug in (
  'kit-stories-culto-de-domingo',
  'card-convite-culto-de-jovens',
  'post-aniversario-da-igreja',
  'kit-natal-completo',
  'carrossel-5-versiculos-da-semana',
  'slide-apresentacao-de-cultos'
);
