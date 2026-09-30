"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { PsdDetailModal } from "@/components/psd/psd-detail-modal";
import type { PsdFile } from "@/lib/types/psd";

export interface CoverflowCarouselProps {
  title: string;
  items: PsdFile[];
  isLoggedIn: boolean;
  availableCredits?: number | null;
}

const STEP_MS = 3500;
const MAX_VISIBLE_OFFSET = 2;

/** Menor distância (com wrap-around) entre `index` e cada item — pra empilhar em coverflow. */
function signedCircularDiff(i: number, index: number, length: number): number {
  let diff = i - index;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

/**
 * Carrossel "coverflow" — cards em leque, o do centro em destaque, os
 * vizinhos menores e rotacionados em perspectiva. Avança sozinho em
 * velocidade moderada, pausa ao passar o mouse, clique abre o detalhe.
 */
export function CoverflowCarousel({ title, items, isLoggedIn, availableCredits = null }: CoverflowCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [openPsd, setOpenPsd] = React.useState<PsdFile | null>(null);

  React.useEffect(() => {
    if (items.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [items.length, paused]);

  React.useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>

      <div
        className="relative flex h-64 items-center justify-center sm:h-72"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {items.map((psd, i) => {
          const offset = signedCircularDiff(i, index, items.length);
          if (Math.abs(offset) > MAX_VISIBLE_OFFSET) return null;

          const abs = Math.abs(offset);
          const translateX = offset * 44;
          const scale = 1 - abs * 0.16;
          const rotateY = offset * -22;
          const zIndex = 10 - abs;
          const opacity = 1 - abs * 0.2;

          return (
            <button
              key={psd.id}
              type="button"
              onClick={() => setOpenPsd(psd)}
              className="absolute h-52 w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-floating transition-transform duration-500 ease-out sm:h-60 sm:w-44"
              style={{
                transform: `translateX(${translateX}%) scale(${scale}) rotateY(${rotateY}deg)`,
                zIndex,
                opacity,
              }}
            >
              {psd.thumbnail_url ? (
                <Image
                  src={psd.thumbnail_url}
                  alt={psd.title}
                  fill
                  sizes="180px"
                  className="object-cover"
                  priority={offset === 0}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity",
                  offset === 0 ? "opacity-0" : "opacity-60"
                )}
              />
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm font-semibold text-foreground">{items[index]?.title}</p>

      {openPsd && (
        <PsdDetailModal
          psd={openPsd}
          open={!!openPsd}
          onClose={() => setOpenPsd(null)}
          isLoggedIn={isLoggedIn}
          availableCredits={availableCredits}
        />
      )}
    </section>
  );
}
