import { Images, ExternalLink } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/utils/supabase/server";
import { getCategories } from "@/lib/psd";
import { getSiteSettings } from "@/lib/settings";
import { getPinterestBoardImages } from "@/lib/pinterest";
import type { Category } from "@/lib/types/psd";
import type { PinterestImage } from "@/lib/pinterest";

export const dynamic = "force-dynamic";

export default async function ReferenciasPage() {
  let categories: Category[] = [];
  let images: PinterestImage[] = [];
  let boardUrl: string | null = null;

  try {
    const supabase = await createClient();
    const [cats, settings] = await Promise.all([getCategories(supabase), getSiteSettings(supabase)]);
    categories = cats;
    boardUrl = settings.referencePinterestUrl;
    if (boardUrl) images = await getPinterestBoardImages(boardUrl);
  } catch (error) {
    console.error("Falha ao carregar a página de referências:", error);
  }

  return (
    <PublicShell categories={categories}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Referências</h1>
          <p className="mt-1 text-sm text-muted-foreground">Inspirações visuais selecionadas pela equipe.</p>
        </div>

        {images.length === 0 ? (
          <EmptyState
            icon={<Images className="h-6 w-6" />}
            title={boardUrl ? "Não foi possível carregar as imagens agora" : "Nenhuma referência configurada ainda"}
            description={
              boardUrl
                ? "O board do Pinterest pode estar temporariamente indisponível. Tente de novo em instantes."
                : "Assim que o admin configurar o link da pasta do Pinterest, as imagens aparecem aqui."
            }
          />
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
            {images.map((image, index) => (
              <a
                key={`${image.link}-${index}`}
                href={image.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-xl border border-border bg-surface break-inside-avoid"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- imagens externas do Pinterest, domínio dinâmico por board */}
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 p-3 text-xs font-medium text-white">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver no Pinterest
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
