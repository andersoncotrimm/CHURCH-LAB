import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageOff, FileType, HardDrive, Ruler, Layers, ArrowLeft } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from "@/components/psd/download-button";
import { CanvaButton } from "@/components/psd/canva-button";
import { createClient } from "@/utils/supabase/server";
import { getPublishedPsdBySlug, getCategories } from "@/lib/psd";
import { getUserCreditsSummary, computeCtaState } from "@/lib/credits";
import type { Category } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default async function PsdDetailPage({ params }: { params: { slug: string } }) {
  let isLoggedIn = false;
  let availableCredits: number | null = null;
  let categories: Category[] = [];

  try {
    const supabase = await createClient();
    categories = await getCategories(supabase);
  } catch (error) {
    console.error("Falha ao carregar categorias:", error);
  }

  const psd = await (async () => {
    try {
      const supabase = await createClient();
      const found = await getPublishedPsdBySlug(supabase, params.slug);
      if (!found) return null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        isLoggedIn = true;
        const credits = await getUserCreditsSummary(supabase, user.id);
        availableCredits = credits?.available ?? null;
      }

      return found;
    } catch (error) {
      console.error("Falha ao carregar detalhes do PSD:", error);
      return null;
    }
  })();

  if (!psd) notFound();

  const fileSize = formatFileSize(psd.file_size);
  const ctaState = computeCtaState(isLoggedIn, availableCredits, psd.credit_cost);
  const hasPsd = !!psd.file_path;
  const hasCanva = !!psd.canva_url;

  return (
    <PublicShell categories={categories}>
      <div className="mx-auto max-w-6xl">
        <Link
          href="/psd"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a biblioteca
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted shadow-card lg:aspect-auto lg:h-full lg:min-h-[520px]">
            {psd.preview_url || psd.thumbnail_url ? (
              <Image
                src={psd.preview_url ?? psd.thumbnail_url!}
                alt={psd.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full min-h-[320px] w-full items-center justify-center text-muted-foreground/40">
                <ImageOff className="h-12 w-12" />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {psd.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {psd.categories.map((c) => (
                  <Badge key={c.id} variant="accent">
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {psd.title}
            </h1>

            {psd.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{psd.description}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-3">
              {psd.dimensions && (
                <div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ruler className="h-3.5 w-3.5" />
                    Dimensões
                  </span>
                  <p className="mt-1 text-sm font-medium text-foreground">{psd.dimensions}</p>
                </div>
              )}
              {psd.slides_count && (
                <div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    Slides
                  </span>
                  <p className="mt-1 text-sm font-medium text-foreground">{psd.slides_count}</p>
                </div>
              )}
              {hasPsd && psd.file_format && (
                <div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileType className="h-3.5 w-3.5" />
                    Formato
                  </span>
                  <p className="mt-1 text-sm font-medium text-foreground">{psd.file_format}</p>
                </div>
              )}
              {hasPsd && fileSize && (
                <div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <HardDrive className="h-3.5 w-3.5" />
                    Tamanho
                  </span>
                  <p className="mt-1 text-sm font-medium text-foreground">{fileSize}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-2">
              {hasPsd && (
                <DownloadButton
                  psdId={psd.id}
                  creditCost={psd.credit_cost}
                  initialState={ctaState}
                  availableCredits={availableCredits}
                />
              )}
              {hasCanva && (
                <CanvaButton
                  psdId={psd.id}
                  creditCost={psd.credit_cost}
                  initialState={ctaState}
                  availableCredits={availableCredits}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

