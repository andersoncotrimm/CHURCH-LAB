import { LayoutGrid, ImageOff } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { PsdCard } from "@/components/psd/psd-card";
import { LibraryControls } from "@/components/psd/library-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/utils/supabase/server";
import { getPublishedPsds, getCategories } from "@/lib/psd";
import { getUserCreditsSummary } from "@/lib/credits";
import type { Category, PsdFile } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

interface PsdLibraryPageProps {
  searchParams: { categoria?: string; busca?: string; ordenar?: string; tipo?: string };
}

export default async function PsdLibraryPage({ searchParams }: PsdLibraryPageProps) {
  // Biblioteca pública: qualquer falha de rede/config do Supabase degrada
  // para "nenhum PSD encontrado" em vez de derrubar a página inteira.
  let userId: string | null = null;
  let allPsds: PsdFile[] = [];
  let categories: Category[] = [];
  let favoritedIds = new Set<string>();
  let availableCredits: number | null = null;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;

    [allPsds, categories] = await Promise.all([getPublishedPsds(supabase), getCategories(supabase)]);

    if (userId) {
      const [{ data: favorites }, credits] = await Promise.all([
        supabase.from("favorites").select("psd_id").eq("user_id", userId),
        getUserCreditsSummary(supabase, userId),
      ]);
      favoritedIds = new Set((favorites ?? []).map((f) => f.psd_id));
      availableCredits = credits?.available ?? null;
    }
  } catch (error) {
    console.error("Falha ao carregar a biblioteca de PSDs:", error);
  }

  const categoria = searchParams.categoria;
  const busca = (searchParams.busca ?? "").trim().toLowerCase();
  const ordenar = searchParams.ordenar ?? "recentes";
  const tipo = searchParams.tipo;

  let filtered = allPsds;

  if (categoria) {
    filtered = filtered.filter((psd) => psd.categories.some((c) => c.slug === categoria));
  }

  if (tipo === "psd") {
    filtered = filtered.filter((psd) => !!psd.file_path);
  } else if (tipo === "canva") {
    filtered = filtered.filter((psd) => !!psd.canva_url);
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
    <PublicShell categories={categories}>
      <div className="mx-auto max-w-6xl">
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
                isLoggedIn={!!userId}
                availableCredits={availableCredits}
              />
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
