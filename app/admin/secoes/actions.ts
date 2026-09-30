"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { notifyIfEnabled } from "@/lib/notifications";

export interface ActionResult {
  error?: string;
}

function parseSectionForm(formData: FormData): { values: { title: string; sort_order: number; is_active: boolean; psd_ids: string[] } } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0");
  const isActive = formData.get("is_active") === "on";
  const psdIds = formData.getAll("psd_ids").map(String).filter(Boolean);

  if (!title) return { error: "Nome da seção é obrigatório." };

  const sortOrder = Number(sortOrderRaw);
  if (!Number.isInteger(sortOrder) || sortOrder < 0) return { error: "Ordem inválida." };

  return { values: { title, sort_order: sortOrder, is_active: isActive, psd_ids: psdIds } };
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
}

async function syncSectionItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sectionId: string,
  psdIds: string[]
): Promise<{ error?: string }> {
  const { error: deleteError } = await supabase.from("home_section_items").delete().eq("section_id", sectionId);
  if (deleteError) return { error: translateSupabaseError(deleteError) };

  if (psdIds.length === 0) return {};

  const { error: insertError } = await supabase.from("home_section_items").insert(
    psdIds.map((psdId, index) => ({ section_id: sectionId, psd_id: psdId, sort_order: index }))
  );
  if (insertError) return { error: translateSupabaseError(insertError) };

  return {};
}

function revalidateHomePaths() {
  revalidatePath("/admin/secoes");
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function createHomeSection(formData: FormData): Promise<ActionResult> {
  const parsed = parseSectionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("home_sections")
    .insert({ title: parsed.values.title, sort_order: parsed.values.sort_order, is_active: parsed.values.is_active })
    .select("id")
    .single();

  if (error || !inserted) return { error: translateSupabaseError(error ?? { message: "Erro ao criar a seção." }) };

  const itemsResult = await syncSectionItems(supabase, inserted.id, parsed.values.psd_ids);
  if (itemsResult.error) return itemsResult;

  if (parsed.values.is_active) {
    await notifyIfEnabled(supabase, "platform_update", `Nova seção "${parsed.values.title}" adicionada na página inicial.`);
  }

  revalidateHomePaths();
  return {};
}

export async function updateHomeSection(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseSectionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("home_sections")
    .update({ title: parsed.values.title, sort_order: parsed.values.sort_order, is_active: parsed.values.is_active })
    .eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  const itemsResult = await syncSectionItems(supabase, id, parsed.values.psd_ids);
  if (itemsResult.error) return itemsResult;

  revalidateHomePaths();
  return {};
}

export async function toggleHomeSectionActive(id: string, nextActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("home_sections").update({ is_active: nextActive }).eq("id", id);
  if (error) return { error: translateSupabaseError(error) };

  revalidateHomePaths();
  return {};
}

export async function deleteHomeSection(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("home_sections").delete().eq("id", id);
  if (error) return { error: translateSupabaseError(error) };

  revalidateHomePaths();
  return {};
}
