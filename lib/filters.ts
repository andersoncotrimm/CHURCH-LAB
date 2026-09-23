import type { SupabaseClient } from "@supabase/supabase-js";

export interface FilterType {
  id: string;
  value: string;
  label: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

/** Filtros de tipo de arquivo ativos, para a barra de filtros da biblioteca. */
export async function getActiveFilterTypes(supabase: SupabaseClient): Promise<FilterType[]> {
  const { data } = await supabase
    .from("filter_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

/** Todos os filtros (inclusive inativos), para a tela de administração. */
export async function getAllFilterTypes(supabase: SupabaseClient): Promise<FilterType[]> {
  const { data } = await supabase.from("filter_types").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}
