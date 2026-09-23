import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, PsdFile } from "@/lib/types/psd";

export interface PsdFileRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  file_path: string | null;
  canva_url: string | null;
  slides_count: number | null;
  file_size: number | null;
  file_format: string | null;
  dimensions: string | null;
  credit_cost: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  psd_categories: { categories: Category | null }[] | null;
}

export async function attachDownloadCounts(
  supabase: SupabaseClient,
  psds: Omit<PsdFile, "downloadsCount">[]
): Promise<PsdFile[]> {
  if (psds.length === 0) return [];

  const { data: downloadRows } = await supabase
    .from("downloads")
    .select("psd_id")
    .in(
      "psd_id",
      psds.map((p) => p.id)
    );

  const counts = new Map<string, number>();
  for (const row of downloadRows ?? []) {
    counts.set(row.psd_id, (counts.get(row.psd_id) ?? 0) + 1);
  }

  return psds.map((psd) => ({ ...psd, downloadsCount: counts.get(psd.id) ?? 0 }));
}

/** Conta favoritos por PSD, para ordenar a fileira "Mais favoritados". */
export async function getFavoritesCounts(
  supabase: SupabaseClient,
  psdIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (psdIds.length === 0) return counts;

  const { data } = await supabase.from("favorites").select("psd_id").in("psd_id", psdIds);
  for (const row of data ?? []) {
    counts.set(row.psd_id, (counts.get(row.psd_id) ?? 0) + 1);
  }
  return counts;
}

export function mapPsdRow(row: PsdFileRow): Omit<PsdFile, "downloadsCount"> {
  const { psd_categories, ...rest } = row;
  return {
    ...rest,
    categories: (psd_categories ?? [])
      .map((pc) => pc.categories)
      .filter((c): c is Category => c !== null),
  };
}

/** Biblioteca pública: só PSDs publicados, mais recentes primeiro. */
export async function getPublishedPsds(supabase: SupabaseClient): Promise<PsdFile[]> {
  const { data, error } = await supabase
    .from("psd_files")
    .select("*, psd_categories(categories(*))")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return attachDownloadCounts(supabase, (data as unknown as PsdFileRow[]).map(mapPsdRow));
}

/** Detalhe público de um PSD publicado pelo slug. */
export async function getPublishedPsdBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<PsdFile | null> {
  const { data, error } = await supabase
    .from("psd_files")
    .select("*, psd_categories(categories(*))")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;

  const [withCount] = await attachDownloadCounts(supabase, [mapPsdRow(data as unknown as PsdFileRow)]);
  return withCount;
}

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data } = await supabase.from("categories").select("*").order("name", { ascending: true });
  return data ?? [];
}

export interface PopularCategory extends Category {
  psdCount: number;
}

/** Categorias com pelo menos um PSD publicado, ordenadas por quantidade (maior primeiro). */
export async function getPopularCategories(supabase: SupabaseClient, limit = 8): Promise<PopularCategory[]> {
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true });
  const { data: categoryLinks } = await supabase
    .from("psd_categories")
    .select("category_id, psd_files!inner(is_published)")
    .eq("psd_files.is_published", true);

  const counts = new Map<string, number>();
  for (const link of categoryLinks ?? []) {
    counts.set(link.category_id, (counts.get(link.category_id) ?? 0) + 1);
  }

  return (categories ?? [])
    .map((category) => ({ ...category, psdCount: counts.get(category.id) ?? 0 }))
    .filter((category) => category.psdCount > 0)
    .sort((a, b) => b.psdCount - a.psdCount)
    .slice(0, limit);
}
