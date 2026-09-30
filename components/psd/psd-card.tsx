"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ImageOff, FileImage, Palette } from "lucide-react";
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

/** Marcas de canto tipo "HUD"/ficha técnica, nos 4 cantos da imagem — igual ao modelo de referência. */
function CornerBrackets({ colorClass }: { colorClass: string }) {
  return (
    <>
      <span className={cn("pointer-events-none absolute left-1.5 top-1.5 h-4 w-4 border-l-2 border-t-2", colorClass)} />
      <span className={cn("pointer-events-none absolute right-1.5 top-1.5 h-4 w-4 border-r-2 border-t-2", colorClass)} />
      <span className={cn("pointer-events-none absolute bottom-1.5 left-1.5 h-4 w-4 border-b-2 border-l-2", colorClass)} />
      <span className={cn("pointer-events-none absolute bottom-1.5 right-1.5 h-4 w-4 border-b-2 border-r-2", colorClass)} />
    </>
  );
}

/** Tracinhos nas laterais, igual ao modelo de referência. */
function SideTicks({ colorClass }: { colorClass: string }) {
  const positions = ["22%", "50%", "78%"];
  return (
    <>
      {positions.map((top) => (
        <React.Fragment key={top}>
          <span className={cn("pointer-events-none absolute -left-px h-3 w-1", colorClass)} style={{ top }} />
          <span className={cn("pointer-events-none absolute -right-px h-3 w-1", colorClass)} style={{ top }} />
        </React.Fragment>
      ))}
    </>
  );
}

function PsdCard({ psd, isFavorited = false, isLoggedIn, availableCredits = null, topLeftBadge }: PsdCardProps) {
  const [favorited, setFavorited] = React.useState(isFavorited);
  const [pending, setPending] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const category = psd.categories[0];
  const hasPsd = !!psd.file_path;
  const hasCanva = !!psd.canva_url;
  const cardShapeAspect = CARD_SHAPE_ASPECT[psd.card_orientation ?? category?.card_shape ?? "square"];
  const typeColor = CONTENT_TYPE_COLOR[psd.content_type];
  const code = psd.id.replace(/-/g, "").slice(0, 6).toUpperCase();

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
          "group flex w-full flex-col overflow-hidden rounded-xl border-[3px] bg-background text-left shadow-card transition-transform hover:-translate-y-1",
          typeColor.border
        )}
      >
        {/* Faixa do título, igual ao modelo de referência. */}
        <div className={cn("relative flex items-center gap-2 px-3 py-2", typeColor.badgeBg)}>
          <h3 className={cn("line-clamp-1 flex-1 text-xs font-extrabold uppercase tracking-wide", typeColor.badgeText)}>
            {psd.title}
          </h3>
          {isLoggedIn ? (
            <button
              onClick={handleFavoriteClick}
              aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              aria-pressed={favorited}
              className={cn("shrink-0 transition-opacity hover:opacity-70", typeColor.badgeText)}
            >
              <Heart className={cn("h-3.5 w-3.5", favorited && "fill-current")} />
            </button>
          ) : (
            <Link
              href="/login"
              onClick={(event) => event.stopPropagation()}
              aria-label="Entrar para favoritar"
              className={cn("shrink-0 transition-opacity hover:opacity-70", typeColor.badgeText)}
            >
              <Heart className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Imagem com moldura tipo HUD (cantos + tracinhos laterais). */}
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

          <CornerBrackets colorClass={typeColor.border} />
          <SideTicks colorClass={typeColor.badgeBg} />

          {topLeftBadge ??
            (psd.is_featured && (
              <Badge variant="accent" className="absolute left-4 top-4 border-0 bg-black/50 backdrop-blur-sm">
                Destaque
              </Badge>
            ))}

          {/* Etiqueta de código + tipo, canto inferior esquerdo — igual ao modelo de referência. */}
          <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1">
            <span className="rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">{code}</span>
            <div className="flex items-center gap-1">
              {category && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                    typeColor.badgeBg,
                    typeColor.badgeText
                  )}
                >
                  {category.name}
                </span>
              )}
              {hasPsd && (
                <span title="Arquivo PSD" className="flex h-4 w-4 items-center justify-center rounded bg-black/75 text-white">
                  <FileImage className="h-2.5 w-2.5" />
                </span>
              )}
              {hasCanva && (
                <span title="Editável no Canva" className="flex h-4 w-4 items-center justify-center rounded bg-black/75 text-white">
                  <Palette className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
          </div>

          {/* Caixa de estatística, canto inferior direito — igual ao modelo de referência (formato "X/Y"). */}
          <div
            className={cn(
              "absolute bottom-3 right-3 rounded-md border-2 border-black/50 px-2 py-1 text-xs font-extrabold",
              typeColor.badgeBg,
              typeColor.badgeText
            )}
          >
            {psd.credit_cost}/{psd.downloadsCount}
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
