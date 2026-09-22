import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageOff, FileType, HardDrive, Ruler, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { Badge } from "@/components/ui/badge";
import { DownloadButton, type DownloadCtaState } from "@/components/psd/download-button";
import { createClient } from "@/utils/supabase/server";
import { getPublishedPsdBySlug } from "@/lib/psd";
import { getUserCreditsSummary } from "@/lib/credits";

export const dynamic = "force-dynamic";

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default async function PsdDetailPage({ params }: { params: { slug: string } }) {
  let ctaState: DownloadCtaState = "guest";
  let availableCredits: number | null = null;
  const psd = await (async () => {
    try {
      const supabase = await createClient();
      const found = await getPublishedPsdBySlug(supabase, params.slug);
      if (!found) return null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const credits = await getUserCreditsSummary(supabase, user.id);
        if (!credits) {
          ctaState = "no-subscription";
        } else {
          availableCredits = credits.available;
          ctaState = credits.available >= found.credit_cost ? "ready" : "insufficient";
        }
      }

      return found;
    } catch (error) {
      console.error("Falha ao carregar detalhes do PSD:", error);
      return null;
    }
  })();

  if (!psd) notFound();

  const fileSize = formatFileSize(psd.file_size);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-10 sm:py-14">
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
                {psd.file_format && (
                  <div>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileType className="h-3.5 w-3.5" />
                      Formato
                    </span>
                    <p className="mt-1 text-sm font-medium text-foreground">{psd.file_format}</p>
                  </div>
                )}
                {psd.dimensions && (
                  <div>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Ruler className="h-3.5 w-3.5" />
                      Dimensões
                    </span>
                    <p className="mt-1 text-sm font-medium text-foreground">{psd.dimensions}</p>
                  </div>
                )}
                {fileSize && (
                  <div>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <HardDrive className="h-3.5 w-3.5" />
                      Tamanho
                    </span>
                    <p className="mt-1 text-sm font-medium text-foreground">{fileSize}</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <DownloadButton
                  psdId={psd.id}
                  creditCost={psd.credit_cost}
                  initialState={ctaState}
                  availableCredits={availableCredits}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
