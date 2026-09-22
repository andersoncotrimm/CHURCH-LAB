import Link from "next/link";
import { Heart, Sparkles, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PsdCard } from "@/components/psd/psd-card";
import { PsdFeatureCard } from "@/components/psd/psd-feature-card";
import { RedownloadButton } from "@/components/psd/redownload-button";
import { createClient } from "@/utils/supabase/server";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const { continueItem, favoriteItem, newItem, popularCategories } = await getDashboardData(supabase, user.id);

  const firstName = (profile?.full_name || user.email || "").split(" ")[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {firstName ? `Olá, ${firstName} 👋` : "Olá 👋"}
        </h1>
        <p className="text-sm text-muted-foreground">Continue de onde parou ou explore novos materiais.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card lg:col-span-2">
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

        <div className="flex flex-col gap-6">
          {favoriteItem ? (
            <PsdCard
              psd={favoriteItem}
              isFavorited
              isLoggedIn
              topLeftBadge={
                <Badge variant="accent" className="absolute left-3 top-3 border-0 bg-black/40 backdrop-blur-sm">
                  <Heart className="h-3 w-3 fill-current" />
                  Favorito
                </Badge>
              }
            />
          ) : (
            <EmptyState
              icon={<Heart className="h-6 w-6" />}
              title="Sem favoritos ainda"
              description="Toque no coração de um PSD para salvá-lo aqui."
              action={
                <Link href="/psd" className="text-sm font-medium text-accent hover:underline">
                  Explorar biblioteca
                </Link>
              }
            />
          )}

          {newItem && (
            <PsdCard
              psd={newItem}
              isLoggedIn
              topLeftBadge={
                <Badge variant="accent" className="absolute left-3 top-3 border-0 bg-black/40 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  Novidade
                </Badge>
              }
            />
          )}
        </div>
      </div>

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
  );
}
