"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Layers, Download, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAutoCarousel } from "@/lib/hooks/use-auto-carousel";
import { getYoutubeVideoId } from "@/lib/youtube";
import { YoutubeBackgroundPlayer } from "@/components/psd/youtube-background-player";
import type { PsdFile } from "@/lib/types/psd";

export interface HeroCarouselProps {
  items: PsdFile[];
  /**
   * "guest": CTA de login (visitante). "member": CTA direto pra página do
   * item (usuário logado). Fica como uma opção fixa (em vez de receber a
   * ação pronta via prop) porque funções não podem atravessar a fronteira
   * Server -> Client Component no Next.js.
   */
  variant: "guest" | "member";
}

/**
 * Banner de destaque em carrossel — avança sozinho a cada 7s, com setas
 * e indicadores para navegar manualmente. Alimentado pelos itens
 * marcados "Destaque da semana" no admin; um slide com link do YouTube
 * vira um vídeo incorporado em vez de imagem estática.
 */
export function HeroCarousel({ items, variant }: HeroCarouselProps) {
  const { index, next, prev, goTo } = useAutoCarousel(items.length, 7000);

  if (items.length === 0) return null;

  const psd = items[index];
  const category = psd.categories[0];
  const videoId = psd.youtube_url ? getYoutubeVideoId(psd.youtube_url) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {videoId ? (
          <YoutubeBackgroundPlayer key={psd.id} videoId={videoId} />
        ) : psd.preview_url || psd.thumbnail_url ? (
          <Image
            key={psd.id}
            src={psd.preview_url ?? psd.thumbnail_url!}
            alt={psd.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
            <Layers className="h-12 w-12" />
          </div>
        )}

        {!videoId && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-background/85 via-background/10 to-transparent sm:block"
            />
          </>
        )}
      </div>

      {!videoId && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:max-w-lg sm:p-10">
          {category && (
            <Badge variant="accent" className="w-fit">
              {category.name}
            </Badge>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">{psd.title}</h1>
          {psd.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">{psd.description}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {variant === "guest" ? (
              <>
                <Link href="/login">
                  <Button variant="accent">
                    <LogIn className="h-4 w-4" />
                    Entrar para baixar
                  </Button>
                </Link>
                <Link href={`/psd/${psd.slug}`}>
                  <Button variant="outline">Mais informações</Button>
                </Link>
              </>
            ) : (
              <Link href={`/psd/${psd.slug}`}>
                <Button variant="accent">
                  <Download className="h-4 w-4" />
                  Ver e baixar
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Destaque anterior"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo destaque"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir para o destaque ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-accent" : "w-1.5 bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
