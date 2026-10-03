import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PsdRow } from "@/components/psd/psd-row";
import { PsdFeatureCard } from "@/components/psd/psd-feature-card";
import { HeroCarousel } from "@/components/psd/hero-carousel";
import { CoverflowCarousel } from "@/components/psd/coverflow-carousel";
import { RedownloadButton } from "@/components/psd/redownload-button";
import { createClient } from "@/utils/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { getUserCreditsSummary } from "@/lib/credits";
import { getPublishedPsds, getFeaturedPsds, getUserFavoritePsds, getFavoritesCounts } from "@/lib/psd";
import { getSiteSettings } from "@/lib/settings";
import { getActiveHomeSections } from "@/lib/home-sections";
import { CONTENT_TYPE_ROUTES } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const [{ continueItem, popularCategories }, credits, allPsds, featuredPsds, favoritePsds, settings, homeSections] =
    await Promise.all([
      getDashboardData(supabase, user.id),
      getUserCreditsSummary(supabase, user.id),
      getPublishedPsds(supabase),
      getFeaturedPsds(supabase),
      getUserFavoritePsds(supabase, user.id),
      getSiteSettings(supabase),
      getActiveHomeSections(supabase),
    ]);

  // Página principal escolhida pelo admin em /admin/configuracoes — leva
  // direto pra seção, em vez do dashboard padrão (carrossel + fileiras).
  if (settings.homeContentType && settings.enabledContentTypes.includes(settings.homeContentType)) {
    redirect(CONTENT_TYPE_ROUTES[settings.homeContentType]);
  }

  const availableCredits = credits?.available ?? null;
  const favoritedIds = new Set(favoritePsds.map((p) => p.id));

  // Sem destaques escolhidos no admin, cai pro mais baixado como único slide.
  const heroItems =
    featuredPsds.length > 0
      ? featuredPsds
      : [...allPsds].sort((a, b) => b.downloadsCount - a.downloadsCount).slice(0, 1);

  const excludeIds = new Set([continueItem?.id, ...heroItems.map((p) => p.id)].filter(Boolean) as string[]);
  const rest = allPsds.filter((p) => !excludeIds.has(p.id));
  const favoritesCounts = await getFavoritesCounts(supabase, rest.map((p) => p.id));

  const mostDownloaded = [...rest].sort((a, b) => b.downloadsCount - a.downloadsCount).slice(0, 12);
  const newest = [...rest]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);
  const mostFavorited = rest
    .filter((p) => (favoritesCounts.get(p.id) ?? 0) > 0)
    .sort((a, b) => (favoritesCounts.get(b.id) ?? 0) - (favoritesCounts.get(a.id) ?? 0))
    .slice(0, 12);

  const firstName = (profile?.full_name || user.email || "").split(" ")[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {firstName ? `Olá, ${firstName} 👋` : "Olá 👋"}
        </h1>
        <p className="text-sm text-muted-foreground">Continue de onde parou ou explore novos materiais.</p>
      </div>

      {heroItems.length > 0 && (
        <HeroCarousel items={heroItems} variant="member" intervalSeconds={settings.carouselIntervalSeconds} />
      )}

      {homeSections.map((section) => (
        <CoverflowCarousel
          key={section.id}
          title={section.title}
          items={section.items}
          isLoggedIn
          availableCredits={availableCredits}
        />
      ))}

      <PsdRow
        title="Mais baixados"
        psds={mostDownloaded}
        isLoggedIn
        favoritedIds={favoritedIds}
        availableCredits={availableCredits}
        viewAllHref="/psd?ordenar=baixados"
      />
      <PsdRow
        title="Novidades"
        psds={newest}
        isLoggedIn
        favoritedIds={favoritedIds}
        availableCredits={availableCredits}
        viewAllHref="/psd"
      />
      <PsdRow
        title="Mais favoritados"
        psds={mostFavorited}
        isLoggedIn
        favoritedIds={favoritedIds}
        availableCredits={availableCredits}
        viewAllHref="/psd"
      />

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

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex items-center gap-2 border-b border-border px-5 pt-5 sm:px-6 sm:pt-6">
          <h2 className="text-sm font-semibold text-foreground">Continuar de onde parou</h2>
        </div>
        {continueItem ? (
          <PsdFeatureCard
            psd={continueItem}
            actions={
              <>
                <RedownloadButton psdId={continueItem.id} variant="accent" label="Baixar novamente" />
                <Link href={`/psd/${continueItem.slug}`}>
                  <Button variant="outline">Mais informações</Button>
                </Link>
              </>
            }
          />
        ) : (
          <div className="p-5 sm:p-6">
            <EmptyState
              icon={<LayoutGrid className="h-6 w-6" />}
              title="Você ainda não baixou nenhum material"
              description="Explore a biblioteca e comece a usar seus créditos."
              action={
                <Link href="/psd">
                  <Button variant="accent">Explorar biblioteca</Button>
                </Link>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
