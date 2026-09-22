import Link from "next/link";
import { LayoutGrid, ImageOff } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { PsdCard } from "@/components/psd/psd-card";
import { LibraryControls } from "@/components/psd/library-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/utils/supabase/server";
import { getPublishedPsds, getCategories } from "@/lib/psd";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PsdLibraryPageProps {
  searchParams: { categoria?: string; busca?: string; ordenar?: string };
}

export default async function PsdLibraryPage({ searchParams }: PsdLibraryPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [allPsds, categories] = await Promise.all([
    getPublishedPsds(supabase),
    getCategories(supabase),
  ]);

  let favoritedIds = new Set<string>();
  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("psd_id")
      .eq("user_id", user.id);
    favoritedIds = new Set((favorites ?? []).map((f) => f.psd_id));
  }

  const categoria = searchParams.categoria;
  const busca = (searchParams.busca ?? "").trim().toLowerCase();
  const ordenar = searchParams.ordenar ?? "recentes";

  let filtered = allPsds;

  if (categoria) {
    filtered = filtered.filter((psd) => psd.categories.some((c) => c.slug === categoria));
  }

  if (busca) {
    filtered = filtered.filter((psd) => psd.title.toLowerCase().includes(busca));
  }

  filtered = [...filtered].sort((a, b) => {
    switch (ordenar) {
      case "baixados":
        return b.downloadsCount - a.downloadsCount;
      case "menor-custo":
        return a.credit_cost - b.credit_cost;
      case "maior-custo":
        return b.credit_cost - a.credit_cost;
      case "az":
        return a.title.localeCompare(b.title, "pt-BR");
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container flex flex-col gap-8 py-10 sm:py-14 lg:flex-row">
          <aside className="shrink-0 lg:w-56">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Categorias
            </p>
            <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
              <Link
                href="/psd"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  !categoria
                    ? "bg-accent-50 text-accent-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/psd?categoria=${cat.slug}`}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    categoria === cat.slug
                      ? "bg-accent-50 text-accent-700"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Biblioteca PSD
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Materiais profissionais prontos para editar.
              </p>
            </div>

            <div className="mb-6">
              <LibraryControls />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={allPsds.length === 0 ? <ImageOff className="h-6 w-6" /> : <LayoutGrid className="h-6 w-6" />}
                title={allPsds.length === 0 ? "Nenhum PSD publicado ainda" : "Nenhum resultado encontrado"}
                description={
                  allPsds.length === 0
                    ? "Assim que a equipe publicar materiais no admin, eles aparecem aqui."
                    : "Ajuste a busca, categoria ou ordenação para encontrar o que procura."
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {filtered.map((psd) => (
                  <PsdCard
                    key={psd.id}
                    psd={psd}
                    isFavorited={favoritedIds.has(psd.id)}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
