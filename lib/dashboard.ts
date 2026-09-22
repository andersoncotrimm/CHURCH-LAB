import type { SupabaseClient } from "@supabase/supabase-js";
import { attachDownloadCounts, getPopularCategories, mapPsdRow, type PopularCategory, type PsdFileRow } from "@/lib/psd";
import type { PsdFile } from "@/lib/types/psd";

export interface DashboardData {
  continueItem: PsdFile | null;
  favoriteItem: PsdFile | null;
  newItem: PsdFile | null;
  popularCategories: PopularCategory[];
}

async function loadPsd(
  supabase: SupabaseClient,
  row: PsdFileRow | null | undefined
): Promise<PsdFile | null> {
  if (!row) return null;
  const [withCount] = await attachDownloadCounts(supabase, [mapPsdRow(row)]);
  return withCount ?? null;
}

/** Monta os dados do dashboard a partir de atividade real do usuário (sem dados fixos). */
export async function getDashboardData(supabase: SupabaseClient, userId: string): Promise<DashboardData> {
  const excludeIds = new Set<string>();

  const { data: lastDownload } = await supabase
    .from("downloads")
    .select("created_at, psd_files(*, psd_categories(categories(*)))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const continueRow = (lastDownload?.psd_files ?? null) as unknown as PsdFileRow | null;
  const continueItem = await loadPsd(supabase, continueRow);
  if (continueItem) excludeIds.add(continueItem.id);

  const { data: favoriteRows } = await supabase
    .from("favorites")
    .select("created_at, psd_files(*, psd_categories(categories(*)))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  let favoriteItem: PsdFile | null = null;
  for (const row of favoriteRows ?? []) {
    const psdRow = row.psd_files as unknown as PsdFileRow | null;
    if (!psdRow || excludeIds.has(psdRow.id)) continue;
    favoriteItem = await loadPsd(supabase, psdRow);
    break;
  }
  if (favoriteItem) excludeIds.add(favoriteItem.id);

  const { data: recentPsds } = await supabase
    .from("psd_files")
    .select("*, psd_categories(categories(*))")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  let newItem: PsdFile | null = null;
  for (const row of (recentPsds ?? []) as unknown as PsdFileRow[]) {
    if (excludeIds.has(row.id)) continue;
    newItem = await loadPsd(supabase, row);
    break;
  }

  const popularCategories = await getPopularCategories(supabase);

  return { continueItem, favoriteItem, newItem, popularCategories };
}
