-- CHURCH-LAB — troca as imagens dos PSDs de teste (seed 20260922210000) de
-- placeholder (placehold.co, caixas de cor sólida) para fotos reais
-- (picsum.photos, serviço público de fotos aleatórias, sem chave), só para
-- dar uma ideia mais realista de como a galeria fica com fotos de verdade.
--
-- Continua sendo dado de TESTE: o arquivo .psd original (file_path) ainda
-- não existe no Storage — troque por upload real em /admin/psd quando
-- houver um arquivo de verdade para cada item.
--
-- Migration aditiva e idempotente (update por slug fixo, sem efeito se o
-- slug não existir), sem BEGIN/COMMIT.

update public.psd_files set
  thumbnail_url = 'https://picsum.photos/seed/church-lab-sunday-service/600/750',
  preview_url = 'https://picsum.photos/seed/church-lab-sunday-service/1200/1500'
where slug = 'kit-stories-culto-de-domingo';

update public.psd_files set
  thumbnail_url = 'https://picsum.photos/seed/church-lab-youth-invite/600/750',
  preview_url = 'https://picsum.photos/seed/church-lab-youth-invite/1200/1500'
where slug = 'card-convite-culto-de-jovens';

update public.psd_files set
  thumbnail_url = 'https://picsum.photos/seed/church-lab-anniversary/600/750',
  preview_url = 'https://picsum.photos/seed/church-lab-anniversary/1200/1500'
where slug = 'post-aniversario-da-igreja';

update public.psd_files set
  thumbnail_url = 'https://picsum.photos/seed/church-lab-christmas-kit/600/750',
  preview_url = 'https://picsum.photos/seed/church-lab-christmas-kit/1200/1500'
where slug = 'kit-natal-completo';

update public.psd_files set
  thumbnail_url = 'https://picsum.photos/seed/church-lab-bible-verses/600/750',
  preview_url = 'https://picsum.photos/seed/church-lab-bible-verses/1200/1500'
where slug = 'carrossel-5-versiculos-da-semana';

update public.psd_files set
  thumbnail_url = 'https://picsum.photos/seed/church-lab-worship-slide/600/750',
  preview_url = 'https://picsum.photos/seed/church-lab-worship-slide/1200/1500'
where slug = 'slide-apresentacao-de-cultos';

do $chk$ begin raise notice 'imagens reais aplicadas aos PSDs de teste (idempotente).'; end $chk$;

-- =========================================================================
-- VERIFICAÇÃO FINAL
-- =========================================================================

select slug, thumbnail_url, preview_url
from public.psd_files
where slug in (
  'kit-stories-culto-de-domingo',
  'card-convite-culto-de-jovens',
  'post-aniversario-da-igreja',
  'kit-natal-completo',
  'carrossel-5-versiculos-da-semana',
  'slide-apresentacao-de-cultos'
)
order by slug;
