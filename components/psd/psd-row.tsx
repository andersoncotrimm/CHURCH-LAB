import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PsdCard } from "@/components/psd/psd-card";
import type { PsdFile } from "@/lib/types/psd";

export interface PsdRowProps {
  title: string;
  psds: PsdFile[];
  isLoggedIn: boolean;
  favoritedIds?: Set<string>;
  availableCredits?: number | null;
  viewAllHref?: string;
}

/** Fileira horizontal com scroll (estilo streaming) — some se não houver itens. */
export function PsdRow({
  title,
  psds,
  isLoggedIn,
  favoritedIds = new Set(),
  availableCredits = null,
  viewAllHref,
}: PsdRowProps) {
  if (psds.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver tudo
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {psds.map((psd) => (
          <div key={psd.id} className="w-36 shrink-0 sm:w-44">
            <PsdCard
              psd={psd}
              isFavorited={favoritedIds.has(psd.id)}
              isLoggedIn={isLoggedIn}
              availableCredits={availableCredits}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
