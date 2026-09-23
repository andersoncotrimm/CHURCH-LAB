"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { FILTER_ICON_NAMES } from "@/lib/filter-icons";

export interface ActionResult {
  error?: string;
}

function parseFilterForm(formData: FormData): { values: { value: string; label: string; icon: string; sort_order: number } } | { error: string } {
  const value = String(formData.get("value") ?? "").trim().toLowerCase();
  const label = String(formData.get("label") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0");

  if (!value || !/^[a-z0-9-]+$/.test(value)) {
    return { error: "Valor inválido. Use apenas letras minúsculas, números e hífens (ex: banner)." };
  }
  if (!label) return { error: "Rótulo é obrigatório." };
  if (!(FILTER_ICON_NAMES as readonly string[]).includes(icon)) return { error: "Ícone inválido." };

  const sortOrder = Number(sortOrderRaw);
  if (!Number.isInteger(sortOrder) || sortOrder < 0) return { error: "Ordem inválida." };

  return { values: { value, label, icon, sort_order: sortOrder } };
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.code === "23505" || error.message.includes("duplicate key")) {
    return "Já existe um filtro com esse valor.";
  }
  if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
}

export async function createFilterType(formData: FormData): Promise<ActionResult> {
  const parsed = parseFilterForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("filter_types").insert(parsed.values);
  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/filtros");
  revalidatePath("/psd");
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  return {};
}

export async function updateFilterType(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseFilterForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("filter_types").update(parsed.values).eq("id", id);
  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/filtros");
  revalidatePath("/psd");
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  return {};
}

export async function toggleFilterActive(id: string, nextActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("filter_types").update({ is_active: nextActive }).eq("id", id);
  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/filtros");
  revalidatePath("/psd");
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  return {};
}

export async function deleteFilterType(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("filter_types").delete().eq("id", id);
  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/filtros");
  revalidatePath("/psd");
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  return {};
}
