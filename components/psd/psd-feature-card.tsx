import Image from "next/image";
import { Zap, ImageOff } from "lucide-react";
import type { PsdFile } from "@/lib/types/psd";

export function PsdFeatureCard({ psd, actions }: { psd: PsdFile; actions: React.ReactNode }) {
  const category = psd.categories[0];

  return (
    <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-6">
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44">
        {psd.thumbnail_url ? (
          <Image src={psd.thumbnail_url} alt={psd.title} fill sizes="176px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4">
        <div>
          {category && (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-600">
              {category.name}
            </span>
          )}
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{psd.title}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-accent" />
              {psd.credit_cost} créditos
            </span>
            <span>{psd.downloadsCount} downloads</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">{actions}</div>
      </div>
    </div>
  );
}
