import { LayoutGrid, ImageOff } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { PsdCard } from "@/components/psd/psd-card";
import { LibraryControls } from "@/components/psd/library-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/utils/supabase/server";
import { getPublishedPsds, getCategories } from "@/lib/psd";
import { getActiveFilterTypes } from "@/lib/filters";
import { getUserCreditsSummary } from "@/lib/credits";
import type { Category, PsdFile, ContentType } from "@/lib/types/psd";
import type { FilterType } from "@/lib/filters";

export interface PsdLibrarySearchParams {
  categoria?: string;
  busca?: string;
  ordenar?: string;
  tipo?: string;
  credito_min?: string;
  credito_max?: string;
}

export interface PsdLibraryViewProps {
  contentType: ContentType;
  title: string;
  description: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  searchParams: PsdLibrarySearchParams;
}

/**
 * Biblioteca genérica reusada por /psd, /elementos, /plugins, /ferramentas
 * e /sistemas — cada rota só muda o `contentType` e os textos. Filtra por
 * seção, categoria, busca, tipo de arquivo (filtros administráveis em
 * /admin/filtros) e faixa de créditos.
 */
export async function PsdLibraryView({
  contentType,
  title,
  description,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  searchParams,
}: PsdLibraryViewProps) {
  // Página pública: qualquer falha de rede/config do Supabase degrada
  // para "nenhum item encontrado" em vez de derrubar a página inteira.
  let userId: string | null = null;
  let allPsds: PsdFile[] = [];
  let categories: Category[] = [];
  let filterTypes: FilterType[] = [];
  let favoritedIds = new Set<string>();
  let availableCredits: number | null = null;

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;

    [allPsds, categories, filterTypes] = await Promise.all([
      getPublishedPsds(supabase, contentType),
      getCategories(supabase),
      getActiveFilterTypes(supabase),
    ]);

    if (userId) {
      const [{ data: favorites }, credits] = await Promise.all([
        supabase.from("favorites").select("psd_id").eq("user_id", userId),
        getUserCreditsSummary(supabase, userId),
      ]);
      favoritedIds = new Set((favorites ?? []).map((f) => f.psd_id));
      availableCredits = credits?.available ?? null;
    }
  } catch (error) {
    console.error(`Falha ao carregar a biblioteca (${contentType}):`, error);
  }

  const categoria = searchParams.categoria;
  const busca = (searchParams.busca ?? "").trim().toLowerCase();
  const ordenar = searchParams.ordenar ?? "recentes";
  const tipo = searchParams.tipo;

  // Limites reais dos créditos entre os itens publicados — definem o range
  // do slider de filtro (não um valor fixo tipo "10 a 1000").
  const creditBounds =
    allPsds.length > 0
      ? {
          min: Math.min(...allPsds.map((psd) => psd.credit_cost)),
          max: Math.max(...allPsds.map((psd) => psd.credit_cost)),
        }
      : undefined;

  const creditoMin = searchParams.credito_min !== undefined ? Number(searchParams.credito_min) : null;
  const creditoMax = searchParams.credito_max !== undefined ? Number(searchParams.credito_max) : null;

  let filtered = allPsds;

  if (categoria) {
    filtered = filtered.filter((psd) => psd.categories.some((c) => c.slug === categoria));
  }

  if (tipo === "psd") {
    filtered = filtered.filter((psd) => !!psd.file_path);
  } else if (tipo === "canva") {
    filtered = filtered.filter((psd) => !!psd.canva_url);
  }

  if (creditoMin !== null && Number.isFinite(creditoMin)) {
    filtered = filtered.filter((psd) => psd.credit_cost >= creditoMin);
  }
  if (creditoMax !== null && Number.isFinite(creditoMax)) {
    filtered = filtered.filter((psd) => psd.credit_cost <= creditoMax);
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="mb-6">
          <LibraryControls placeholder={searchPlaceholder} creditBounds={creditBounds} filters={filterTypes} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={allPsds.length === 0 ? <ImageOff className="h-6 w-6" /> : <LayoutGrid className="h-6 w-6" />}
            title={allPsds.length === 0 ? emptyTitle : "Nenhum resultado encontrado"}
            description={
              allPsds.length === 0
                ? emptyDescription
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
