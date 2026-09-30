"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Zap,
  Download,
  ImageOff,
  FileImage,
  Palette,
  Shapes,
  Plug,
  Wrench,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toggleFavorite } from "@/app/actions/favorites";
import { PsdDetailModal } from "@/components/psd/psd-detail-modal";
import { CARD_SHAPE_ASPECT, CONTENT_TYPE_COLOR } from "@/lib/types/psd";
import type { PsdFile, ContentType } from "@/lib/types/psd";

export interface PsdCardProps {
  psd: PsdFile;
  isFavorited?: boolean;
  isLoggedIn: boolean;
  availableCredits?: number | null;
  topLeftBadge?: React.ReactNode;
}

/** Ícone por tipo de conteúdo — selo de canto do card, estilo "trading card" (um ícone por tipo, como a classe do personagem). */
const CONTENT_TYPE_ICON: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  psd: FileImage,
  elementos: Shapes,
  plugins: Plug,
  ferramentas: Wrench,
  sistemas: LayoutGrid,
};

function PsdCard({ psd, isFavorited = false, isLoggedIn, availableCredits = null, topLeftBadge }: PsdCardProps) {
  const [favorited, setFavorited] = React.useState(isFavorited);
  const [pending, setPending] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const category = psd.categories[0];
  const hasPsd = !!psd.file_path;
  const hasCanva = !!psd.canva_url;
  const cardShapeAspect = CARD_SHAPE_ASPECT[psd.card_orientation ?? category?.card_shape ?? "square"];
  const typeColor = CONTENT_TYPE_COLOR[psd.content_type];
  const TypeIcon = CONTENT_TYPE_ICON[psd.content_type];

  async function handleFavoriteClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (!isLoggedIn || pending) return;
    setPending(true);
    const prev = favorited;
    setFavorited(!prev);
    const result = await toggleFavorite(psd.id);
    setPending(false);
    if (result.error) setFavorited(prev);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className={cn(
          "group flex w-full flex-col overflow-hidden rounded-2xl border-2 bg-surface text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-floating",
          typeColor.border
        )}
      >
        <div className={cn("relative w-full overflow-hidden bg-muted", cardShapeAspect)}>
          {psd.thumbnail_url ? (
            <Image
              src={psd.thumbnail_url}
              alt={psd.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ImageOff className="h-10 w-10" />
            </div>
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          />

          {isLoggedIn ? (
            <button
              onClick={handleFavoriteClick}
              aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              aria-pressed={favorited}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              <Heart className={cn("h-4 w-4", favorited && "fill-danger text-danger")} />
            </button>
          ) : (
            <Link
              href="/login"
              onClick={(event) => event.stopPropagation()}
              aria-label="Entrar para favoritar"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              <Heart className="h-4 w-4" />
            </Link>
          )}

          {topLeftBadge ??
            (psd.is_featured && (
              <Badge variant="accent" className="absolute left-3 top-3 border-0 bg-black/40 backdrop-blur-sm">
                Destaque
              </Badge>
            ))}

          {/* Selo de canto por tipo de conteúdo — como a classe/raridade de uma trading card. */}
          <span
            title={psd.content_type}
            className={cn(
              "absolute bottom-3 left-3 flex h-7 w-7 items-center justify-center rounded-lg shadow-card",
              typeColor.badgeBg,
              typeColor.badgeText
            )}
          >
            <TypeIcon className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4 pb-3">
          {category && (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-600">
              {category.name}
            </span>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{psd.title}</h3>
        </div>

        {/* Barra de estatísticas no rodapé — estrutura de trading card (créditos/downloads no lugar de ATK/HP). */}
        <div className={cn("flex items-center justify-between border-t bg-background/40 px-4 py-2.5", typeColor.border)}>
          <span className={cn("inline-flex items-center gap-1 text-sm font-bold", typeColor.statText)}>
            <Zap className="h-3.5 w-3.5" />
            {psd.credit_cost}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            {psd.downloadsCount}
          </span>
          <div className="flex items-center gap-1">
            {hasPsd && (
              <span
                title="Arquivo PSD"
                className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground"
              >
                <FileImage className="h-3.5 w-3.5" />
              </span>
            )}
            {hasCanva && (
              <span
                title="Editável no Canva"
                className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground"
              >
                <Palette className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </button>

      <PsdDetailModal
        psd={psd}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        isLoggedIn={isLoggedIn}
        availableCredits={availableCredits}
      />
    </>
  );
}

export { PsdCard };
