"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { CategoryFormValues } from "@/lib/types/psd";

export interface ActionResult {
  error?: string;
}

function parseCategoryForm(formData: FormData): { values: CategoryFormValues } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Nome é obrigatório." };

  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug inválido. Use apenas letras minúsculas, números e hífens." };
  }

  return { values: { name, slug, description } };
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.code === "23505" || error.message.includes("duplicate key")) {
    return "Já existe uma categoria com esse slug.";
  }
  if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const parsed = parseCategoryForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.values.name,
    slug: parsed.values.slug,
    description: parsed.values.description || null,
  });

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath("/psd");
  return {};
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseCategoryForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.values.name,
      slug: parsed.values.slug,
      description: parsed.values.description || null,
    })
    .eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath("/psd");
  return {};
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/categorias");
  revalidatePath("/categorias");
  revalidatePath("/psd");
  return {};
}
