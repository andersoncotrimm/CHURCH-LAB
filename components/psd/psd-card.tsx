"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Zap, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toggleFavorite } from "@/app/actions/favorites";
import type { PsdFile } from "@/lib/types/psd";

export interface PsdCardProps {
  psd: PsdFile;
  isFavorited?: boolean;
  isLoggedIn: boolean;
  topLeftBadge?: React.ReactNode;
}

function PsdCard({ psd, isFavorited = false, isLoggedIn, topLeftBadge }: PsdCardProps) {
  const [favorited, setFavorited] = React.useState(isFavorited);
  const [pending, setPending] = React.useState(false);
  const category = psd.categories[0];

  async function handleFavoriteClick(event: React.MouseEvent) {
    event.preventDefault();
    if (!isLoggedIn || pending) return;
    setPending(true);
    const prev = favorited;
    setFavorited(!prev);
    const result = await toggleFavorite(psd.id);
    setPending(false);
    if (result.error) setFavorited(prev);
  }

  return (
    <Link
      href={`/psd/${psd.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all hover:-translate-y-1 hover:border-accent-300/40 hover:shadow-floating"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
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
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {category && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-600">
            {category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{psd.title}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent-700">
            <Zap className="h-3.5 w-3.5" />
            {psd.credit_cost} créditos
          </span>
          <span className="text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Ver detalhes →
          </span>
        </div>
      </div>
    </Link>
  );
}

export { PsdCard };
