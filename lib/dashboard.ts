import type { SupabaseClient } from "@supabase/supabase-js";
import { attachDownloadCounts, getPopularCategories, mapPsdRow, type PopularCategory, type PsdFileRow } from "@/lib/psd";
import type { PsdFile } from "@/lib/types/psd";

export interface DashboardData {
  continueItem: PsdFile | null;
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
  const { data: lastDownload } = await supabase
    .from("downloads")
    .select("created_at, psd_files(*, psd_categories(categories(*)))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const continueRow = (lastDownload?.psd_files ?? null) as unknown as PsdFileRow | null;
  const continueItem = await loadPsd(supabase, continueRow);

  const popularCategories = await getPopularCategories(supabase);

  return { continueItem, popularCategories };
}
