"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface ActionResult {
  error?: string;
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
}

export async function createReferenceBoard(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const pinterestUrl = String(formData.get("pinterest_url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) return { error: "Título é obrigatório." };

  if (!pinterestUrl || !/^https:\/\/(www\.)?pinterest\./.test(pinterestUrl)) {
    return { error: "Cole um link válido do Pinterest (começando com https://pinterest...)." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("reference_boards").insert({
    title,
    pinterest_url: pinterestUrl,
    notes: notes || null,
    created_by: user?.id ?? null,
  });

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/referencias");
  return {};
}

export async function deleteReferenceBoard(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("reference_boards").delete().eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/referencias");
  return {};
}
