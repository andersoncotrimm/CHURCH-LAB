import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Heart, ImageOff, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PsdRow } from "@/components/psd/psd-row";
import { HeroCarousel } from "@/components/psd/hero-carousel";
import { CoverflowCarousel } from "@/components/psd/coverflow-carousel";
import { RedownloadButton } from "@/components/psd/redownload-button";
import { WidgetCard } from "@/components/app/widget-card";
import { CreditsRing } from "@/components/app/credits-ring";
import { createClient } from "@/utils/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { getUserCreditsSummary } from "@/lib/credits";
import { getPublishedPsds, getFeaturedPsds, getUserFavoritePsds, getFavoritesCounts } from "@/lib/psd";
import { getSiteSettings } from "@/lib/settings";
import { getActiveHomeSections } from "@/lib/home-sections";
import { CONTENT_TYPE_ROUTES } from "@/lib/types/psd";
import type { PsdFile } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

const CATEGORY_CHIP_TONES = ["purple", "blue", "orange", "pink", "accent"] as const;

function MiniPsdListItem({ psd, meta }: { psd: PsdFile; meta: string }) {
  return (
    <Link
      href={`/psd/${psd.slug}`}
      className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-white/5"
    >
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-black/20">
        {psd.thumbnail_url ? (
          <Image src={psd.thumbnail_url} alt={psd.title} fill sizes="36px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground/40">
            <ImageOff className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">{psd.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{meta}</p>
      </div>
    </Link>
  );
}

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

  // Só exclui os itens do carrossel de destaques (pra não repetir o mesmo
  // card ali e numa fileira logo abaixo). O item de "Continuar de onde
  // parou" continua aparecendo nas fileiras normalmente — baixar um
  // material não deve tirá-lo de circulação.
  const excludeIds = new Set(heroItems.map((p) => p.id));
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:[grid-auto-rows:8.5rem]">
        <WidgetCard tone="purple" className="col-span-2 row-span-2 justify-end">
          {continueItem ? (
            <>
              {continueItem.thumbnail_url && (
                <Image
                  src={continueItem.thumbnail_url}
                  alt={continueItem.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover opacity-50"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="relative flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                  Continuar de onde parou
                </span>
                <h2 className="line-clamp-2 text-xl font-bold text-white">{continueItem.title}</h2>
                <div className="mt-1 flex flex-wrap gap-2">
                  <RedownloadButton psdId={continueItem.id} variant="accent" label="Baixar novamente" />
                  <Link href={`/psd/${continueItem.slug}`}>
                    <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                      Mais informações
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="relative">
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
        </WidgetCard>

        <WidgetCard tone="accent" className="flex-row items-center gap-3">
          <CreditsRing available={credits?.available ?? 0} granted={credits?.granted ?? 1} />
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none">{credits?.available ?? 0}</p>
            <p className="mt-1 text-xs font-medium opacity-80">créditos restantes</p>
          </div>
        </WidgetCard>

        <WidgetCard tone="blue" className="justify-center">
          <p className="truncate text-sm font-bold">{credits?.planName ?? "Sem plano ativo"}</p>
          <p className="mt-1 text-xs opacity-80">
            {credits?.periodEnd
              ? `${credits.autoRenews ? "Renova" : "Expira"} em ${new Date(credits.periodEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`
              : "Assine pra ganhar créditos"}
          </p>
        </WidgetCard>

        <WidgetCard tone="surface" className="gap-1">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Heart className="h-3.5 w-3.5" /> Mais favoritados
          </p>
          <div className="flex flex-1 flex-col justify-center gap-0.5">
            {mostFavorited.length > 0 ? (
              mostFavorited
                .slice(0, 2)
                .map((psd) => (
                  <MiniPsdListItem key={psd.id} psd={psd} meta={`${favoritesCounts.get(psd.id) ?? 0} favoritos`} />
                ))
            ) : (
              <p className="px-1.5 text-xs text-muted-foreground">Ninguém favoritou ainda.</p>
            )}
          </div>
        </WidgetCard>

        <WidgetCard tone="surface" className="gap-1">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Download className="h-3.5 w-3.5" /> Mais baixados
          </p>
          <div className="flex flex-1 flex-col justify-center gap-0.5">
            {mostDownloaded.length > 0 ? (
              mostDownloaded
                .slice(0, 2)
                .map((psd) => <MiniPsdListItem key={psd.id} psd={psd} meta={`${psd.downloadsCount} downloads`} />)
            ) : (
              <p className="px-1.5 text-xs text-muted-foreground">Nenhum download ainda.</p>
            )}
          </div>
        </WidgetCard>
      </div>

      {popularCategories.length > 0 && (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {popularCategories.map((category, index) => {
            const tone = CATEGORY_CHIP_TONES[index % CATEGORY_CHIP_TONES.length];
            return (
              <Link
                key={category.id}
                href={`/psd?categoria=${category.slug}`}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <WidgetCard
                  tone={tone}
                  className="h-14 w-14 items-center justify-center rounded-full p-0 text-base font-bold"
                >
                  {category.name.slice(0, 1).toUpperCase()}
                </WidgetCard>
                <span className="max-w-[4.5rem] truncate text-center text-[11px] font-medium text-muted-foreground">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
