"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isValidHex } from "@/lib/color";

export interface ActionResult {
  error?: string;
}

export async function updateSiteSettings(formData: FormData): Promise<ActionResult> {
  const siteName = String(formData.get("site_name") ?? "").trim();
  const backgroundColor = String(formData.get("background_color") ?? "").trim();
  const buttonColor = String(formData.get("button_color") ?? "").trim();

  if (!siteName) return { error: "O nome da plataforma é obrigatório." };
  if (siteName.length > 40) return { error: "Nome muito longo (máx. 40 caracteres)." };
  if (!isValidHex(backgroundColor)) return { error: "Cor de fundo inválida." };
  if (!isValidHex(buttonColor)) return { error: "Cor do botão inválida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: siteName,
      background_color: backgroundColor,
      button_color: buttonColor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
      return { error: "Você não tem permissão de administrador para esta ação." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return {};
}
