"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ImageOff, FileImage, Palette, Shapes, Plug, Wrench, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toggleFavorite } from "@/app/actions/favorites";
import { PsdDetailModal } from "@/components/psd/psd-detail-modal";
import { CARD_SHAPE_ASPECT, CONTENT_TYPE_COLOR, CONTENT_TYPES } from "@/lib/types/psd";
import type { PsdFile, ContentType } from "@/lib/types/psd";

export interface PsdCardProps {
  psd: PsdFile;
  isFavorited?: boolean;
  isLoggedIn: boolean;
  availableCredits?: number | null;
  topLeftBadge?: React.ReactNode;
}

const CONTENT_TYPE_LABEL: Record<ContentType, string> = Object.fromEntries(
  CONTENT_TYPES.map((type) => [type.value, type.label])
) as Record<ContentType, string>;

const CONTENT_TYPE_ICON: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  psd: FileImage,
  elementos: Shapes,
  plugins: Plug,
  ferramentas: Wrench,
  sistemas: LayoutGrid,
};

/** Mordida retangular no canto superior direito, com o selo circular de classe dentro — igual ao modelo de referência (Storm Breakers). */
const NOTCH_W = 52;
const NOTCH_H = 26;
const NOTCH_CLIP_PATH = `polygon(0 0, calc(100% - ${NOTCH_W}px) 0, calc(100% - ${NOTCH_W}px) ${NOTCH_H}px, 100% ${NOTCH_H}px, 100% 100%, 0 100%)`;

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
        style={{ clipPath: NOTCH_CLIP_PATH }}
        className="group relative flex w-full flex-col overflow-hidden bg-surface text-left shadow-card transition-transform hover:-translate-y-1"
      >
        <div className={cn("relative w-full overflow-hidden", cardShapeAspect, typeColor.badgeBg)}>
          {psd.thumbnail_url ? (
            <Image
              src={psd.thumbnail_url}
              alt={psd.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={cn("flex h-full w-full items-center justify-center", typeColor.badgeText, "opacity-40")}>
              <ImageOff className="h-10 w-10" />
            </div>
          )}

          {/* Selo redondo de classe/tipo, encaixado na mordida do canto. */}
          <span className="absolute right-1.5 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-card">
            <TypeIcon className={cn("h-3.5 w-3.5", typeColor.statText)} />
          </span>

          <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
            {isLoggedIn ? (
              <button
                onClick={handleFavoriteClick}
                aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                aria-pressed={favorited}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
              >
                <Heart className={cn("h-3.5 w-3.5", favorited && "fill-danger text-danger")} />
              </button>
            ) : (
              <Link
                href="/login"
                onClick={(event) => event.stopPropagation()}
                aria-label="Entrar para favoritar"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
              >
                <Heart className="h-3.5 w-3.5" />
              </Link>
            )}

            {topLeftBadge ??
              (psd.is_featured && (
                <Badge variant="accent" className="border-0 bg-black/40 backdrop-blur-sm">
                  Destaque
                </Badge>
              ))}
          </div>

          {/* Estrelinhas decorativas, igual ao modelo de referência. */}
          <div className="absolute bottom-[3.6rem] right-2.5 flex gap-0.5">
            <Star className="h-2.5 w-2.5 fill-warning text-warning" />
            <Star className="h-2.5 w-2.5 fill-warning text-warning" />
          </div>

          {(hasPsd || hasCanva) && (
            <div className="absolute bottom-[3.6rem] left-2.5 flex items-center gap-1">
              {hasPsd && (
                <span title="Arquivo PSD" className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white">
                  <FileImage className="h-2.5 w-2.5" />
                </span>
              )}
              {hasCanva && (
                <span title="Editável no Canva" className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white">
                  <Palette className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
          )}

          {/* Placa com o tipo + nome, estilo "adesivo" sobre a arte — igual ao modelo de referência. */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-2.5 pt-10">
            <span className={cn("block text-[10px] font-extrabold uppercase tracking-wider", typeColor.statText)}>
              {CONTENT_TYPE_LABEL[psd.content_type]}
            </span>
            <h3 className="line-clamp-1 text-base font-extrabold leading-tight text-white">{psd.title}</h3>
          </div>
        </div>

        {/* Barra de estatísticas no rodapé, dividida — igual ao modelo de referência (Attack/HP -> créditos/downloads). */}
        <div className="grid grid-cols-2 divide-x divide-white/10 bg-black/90 px-3 py-2">
          <div className="flex flex-col pr-2">
            <span className="text-[10px] font-medium text-white/45">Créditos</span>
            <span className={cn("text-sm font-bold", typeColor.statText)}>{psd.credit_cost}</span>
          </div>
          <div className="flex flex-col pl-2">
            <span className="text-[10px] font-medium text-white/45">Downloads</span>
            <span className="text-sm font-bold text-success">{psd.downloadsCount}</span>
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
