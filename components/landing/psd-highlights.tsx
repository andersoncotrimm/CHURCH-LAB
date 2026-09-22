import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PsdCard } from "@/components/psd/psd-card";
import { cn } from "@/lib/utils";
import type { PsdFile } from "@/lib/types/psd";

export function PsdHighlights({
  psds,
  favoritedIds,
  isLoggedIn,
}: {
  psds: PsdFile[];
  favoritedIds: Set<string>;
  isLoggedIn: boolean;
}) {
  if (psds.length === 0) return null;

  return (
    <section className="container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">Biblioteca</span>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Materiais prontos para usar hoje
        </h2>
        <p className="mt-4 text-balance text-muted-foreground">
          Uma amostra da biblioteca de PSDs — kits, stories, carrosséis e muito mais.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {psds.map((psd) => (
          <PsdCard key={psd.id} psd={psd} isFavorited={favoritedIds.has(psd.id)} isLoggedIn={isLoggedIn} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/psd" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "group")}>
          Ver biblioteca completa
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
