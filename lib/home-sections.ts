import type { SupabaseClient } from "@supabase/supabase-js";
import { attachDownloadCounts, mapPsdRow, type PsdFileRow } from "@/lib/psd";
import type { HomeSection, HomeSectionWithItems } from "@/lib/types/psd";

/** Seções ativas da home, com os PSDs publicados de cada uma (na ordem escolhida no admin). */
export async function getActiveHomeSections(supabase: SupabaseClient): Promise<HomeSectionWithItems[]> {
  const { data: sections } = await supabase
    .from("home_sections")
    .select("id, title, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!sections || sections.length === 0) return [];

  const sectionIds = sections.map((s) => s.id);
  const { data: itemRows } = await supabase
    .from("home_section_items")
    .select("section_id, sort_order, psd_files(*, psd_categories(categories(*)))")
    .in("section_id", sectionIds)
    .order("sort_order", { ascending: true });

  const itemsBySection = new Map<string, PsdFileRow[]>();
  for (const row of itemRows ?? []) {
    const psdRow = row.psd_files as unknown as (PsdFileRow & { is_published: boolean }) | null;
    if (!psdRow || !psdRow.is_published) continue;
    const list = itemsBySection.get(row.section_id) ?? [];
    list.push(psdRow);
    itemsBySection.set(row.section_id, list);
  }

  const result: HomeSectionWithItems[] = [];
  for (const section of sections) {
    const rows = itemsBySection.get(section.id) ?? [];
    if (rows.length === 0) continue;
    const items = await attachDownloadCounts(supabase, rows.map(mapPsdRow));
    result.push({ ...section, items });
  }

  return result;
}

export interface HomeSectionWithCount extends HomeSection {
  itemIds: string[];
}

/** Todas as seções (inclusive inativas) já com os IDs dos PSDs de cada uma — pra tela de administração. */
export async function getAllHomeSections(supabase: SupabaseClient): Promise<HomeSectionWithCount[]> {
  const [{ data: sections }, { data: items }] = await Promise.all([
    supabase.from("home_sections").select("id, title, sort_order, is_active").order("sort_order", { ascending: true }),
    supabase.from("home_section_items").select("section_id, psd_id").order("sort_order", { ascending: true }),
  ]);

  const itemIdsBySection = new Map<string, string[]>();
  for (const row of items ?? []) {
    const list = itemIdsBySection.get(row.section_id) ?? [];
    list.push(row.psd_id);
    itemIdsBySection.set(row.section_id, list);
  }

  return (sections ?? []).map((section) => ({ ...section, itemIds: itemIdsBySection.get(section.id) ?? [] }));
}
