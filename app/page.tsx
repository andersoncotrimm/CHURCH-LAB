import Link from "next/link";
import { redirect } from "next/navigation";
import { Layers, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { PsdFeatureCard } from "@/components/psd/psd-feature-card";
import { PsdCard } from "@/components/psd/psd-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/utils/supabase/server";
import { getPublishedPsds, getPopularCategories, getCategories, type PopularCategory } from "@/lib/psd";
import type { Category, PsdFile } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // A home pública nunca pode derrubar o site inteiro por causa de um erro
  // de rede/config do Supabase — qualquer falha aqui degrada para a visão
  // anônima com biblioteca vazia, em vez de estourar um erro 500.
  let userId: string | null = null;
  let allPsds: PsdFile[] = [];
  let popularCategories: PopularCategory[] = [];
  let categories: Category[] = [];

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;

    if (!userId) {
      [allPsds, popularCategories, categories] = await Promise.all([
        getPublishedPsds(supabase),
        getPopularCategories(supabase),
        getCategories(supabase),
      ]);
    }
  } catch (error) {
    console.error("Falha ao carregar a home pública:", error);
  }

  if (userId) redirect("/dashboard");

  const excludeIds = new Set<string>();

  const featuredItem = [...allPsds].sort((a, b) => b.downloadsCount - a.downloadsCount)[0] ?? null;
  if (featuredItem) excludeIds.add(featuredItem.id);

  const highlightItem = allPsds.find((p) => p.is_featured && !excludeIds.has(p.id)) ?? null;
  if (highlightItem) excludeIds.add(highlightItem.id);

  const newItem = allPsds.find((p) => !excludeIds.has(p.id)) ?? null;

  return (
    <PublicShell categories={categories}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Biblioteca de PSDs para a sua igreja
          </h1>
          <p className="text-sm text-muted-foreground">
            Kits, stories, carrosséis e muito mais, prontos para editar. Crie sua conta para baixar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-border px-5 pt-5 sm:px-6 sm:pt-6">
              <h2 className="text-sm font-semibold text-foreground">Mais baixado</h2>
            </div>
            {featuredItem ? (
              <PsdFeatureCard
                psd={featuredItem}
                actions={
                  <>
                    <Link href="/login">
                      <Button variant="accent">Entrar para baixar</Button>
                    </Link>
                    <Link href={`/psd/${featuredItem.slug}`}>
                      <Button variant="outline">Mais informações</Button>
                    </Link>
                  </>
                }
              />
            ) : (
              <div className="p-5 sm:p-6">
                <EmptyState
                  icon={<Layers className="h-6 w-6" />}
                  title="Biblioteca em construção"
                  description="Novos materiais chegam em breve."
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {highlightItem && (
              <PsdCard
                psd={highlightItem}
                isLoggedIn={false}
                topLeftBadge={
                  <Badge variant="accent" className="absolute left-3 top-3 border-0 bg-black/40 backdrop-blur-sm">
                    Destaque
                  </Badge>
                }
              />
            )}

            {newItem && (
              <PsdCard
                psd={newItem}
                isLoggedIn={false}
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
    </PublicShell>
  );
}
