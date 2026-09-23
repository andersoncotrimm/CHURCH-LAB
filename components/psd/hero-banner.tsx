import Image from "next/image";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PsdFile } from "@/lib/types/psd";

export function HeroBanner({ psd, actions }: { psd: PsdFile; actions: React.ReactNode }) {
  const category = psd.categories[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {psd.preview_url || psd.thumbnail_url ? (
          <Image
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-background/85 via-background/10 to-transparent sm:block"
        />
      </div>

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
        <div className="mt-1 flex flex-wrap items-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
