"use client";

import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PsdCard } from "@/components/psd/psd-card";
import { cn } from "@/lib/utils";
import { useAutoCarousel } from "@/lib/hooks/use-auto-carousel";
import type { PsdFile } from "@/lib/types/psd";

/** Mini-carrossel com os favoritos do usuário, um card por vez, avançando sozinho a cada 5s. */
export function FavoritesCarousel({
  items,
  availableCredits,
}: {
  items: PsdFile[];
  availableCredits: number | null;
}) {
  const { index, next, prev, goTo } = useAutoCarousel(items.length, 5000);

  if (items.length === 0) return null;

  const psd = items[index];

  return (
    <div className="relative">
      <PsdCard
        key={psd.id}
        psd={psd}
        isFavorited
        isLoggedIn
        availableCredits={availableCredits}
        topLeftBadge={
          <Badge variant="accent" className="absolute left-3 top-3 border-0 bg-black/40 backdrop-blur-sm">
            <Heart className="h-3 w-3 fill-current" />
            Favorito
          </Badge>
        }
      />

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Favorito anterior"
            className="absolute left-2 top-[38%] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo favorito"
            className="absolute right-2 top-[38%] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="mt-2 flex justify-center gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir para o favorito ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-5 bg-accent" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
