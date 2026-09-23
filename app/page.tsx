import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicShell } from "@/components/public/public-shell";
import { HeroCarousel } from "@/components/psd/hero-carousel";
import { PsdRow } from "@/components/psd/psd-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Layers } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import {
  getPublishedPsds,
  getFeaturedPsds,
  getPopularCategories,
  getCategories,
  getFavoritesCounts,
  type PopularCategory,
} from "@/lib/psd";
import { getSiteSettings } from "@/lib/settings";
import type { Category, PsdFile } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // A home pública nunca pode derrubar o site inteiro por causa de um erro
  // de rede/config do Supabase — qualquer falha aqui degrada para a visão
  // anônima com biblioteca vazia, em vez de estourar um erro 500.
  let userId: string | null = null;
  let allPsds: PsdFile[] = [];
  let featuredPsds: PsdFile[] = [];
  let popularCategories: PopularCategory[] = [];
  let categories: Category[] = [];
  let favoritesCounts = new Map<string, number>();
  let carouselIntervalSeconds = 7;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;

    if (!userId) {
      const [publishedPsds, featured, popular, cats, settings] = await Promise.all([
        getPublishedPsds(supabase),
        getFeaturedPsds(supabase),
        getPopularCategories(supabase),
        getCategories(supabase),
        getSiteSettings(supabase),
      ]);
      allPsds = publishedPsds;
      featuredPsds = featured;
      popularCategories = popular;
      categories = cats;
      carouselIntervalSeconds = settings.carouselIntervalSeconds;
      favoritesCounts = await getFavoritesCounts(supabase, allPsds.map((p) => p.id));
    }
  } catch (error) {
    console.error("Falha ao carregar a home pública:", error);
  }

  if (userId) redirect("/dashboard");

  // Sem destaques escolhidos no admin, cai pro mais baixado como único slide.
  const heroItems =
    featuredPsds.length > 0
      ? featuredPsds
      : [[...allPsds].sort((a, b) => b.downloadsCount - a.downloadsCount)[0]].filter(
          (p): p is PsdFile => !!p
        );
  const heroIds = new Set(heroItems.map((p) => p.id));
  const rest = allPsds.filter((p) => !heroIds.has(p.id));

  const mostDownloaded = [...rest].sort((a, b) => b.downloadsCount - a.downloadsCount).slice(0, 12);
  const newest = [...rest]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);
  const mostFavorited = rest
    .filter((p) => (favoritesCounts.get(p.id) ?? 0) > 0)
    .sort((a, b) => (favoritesCounts.get(b.id) ?? 0) - (favoritesCounts.get(a.id) ?? 0))
    .slice(0, 12);

  return (
    <PublicShell categories={categories}>
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        {heroItems.length > 0 ? (
          <HeroCarousel items={heroItems} variant="guest" intervalSeconds={carouselIntervalSeconds} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10">
            <EmptyState
              icon={<Layers className="h-6 w-6" />}
              title="Biblioteca em construção"
              description="Novos materiais chegam em breve."
            />
          </div>
        )}

        <PsdRow title="Mais baixados" psds={mostDownloaded} isLoggedIn={false} viewAllHref="/psd?ordenar=baixados" />
        <PsdRow title="Novidades" psds={newest} isLoggedIn={false} viewAllHref="/psd" />
        <PsdRow title="Mais favoritados" psds={mostFavorited} isLoggedIn={false} viewAllHref="/psd" />

        {popularCategories.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">Categorias populares</h2>
            <div className="flex flex-wrap gap-2">
              {popularCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/psd?categoria=${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent-300/40 hover:bg-accent-50 hover:text-accent-700"
                >
                  {category.name}
                  <span className="text-xs text-muted-foreground">{category.psdCount}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
