"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { PlatformVersionStatus } from "@/lib/types/platform-version";

export interface ActionResult {
  error?: string;
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
}

/** Registra uma atualização da plataforma — chamada manualmente pelo admin ou a cada rodada de alterações. */
export async function createPlatformVersion(formData: FormData): Promise<ActionResult> {
  const version = String(formData.get("version") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "ok");
  const status: PlatformVersionStatus = statusRaw === "warning" || statusRaw === "error" ? statusRaw : "ok";

  if (!version) return { error: "A versão é obrigatória." };
  if (!title) return { error: "O título é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("platform_versions")
    .insert({ version, title, description: description || null, status });

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/seguranca");
  return {};
}

export async function deletePlatformVersion(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("platform_versions").delete().eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/seguranca");
  return {};
}
