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
  const carouselIntervalRaw = String(formData.get("carousel_interval_seconds") ?? "").trim();
  const referencePinterestUrl = String(formData.get("reference_pinterest_url") ?? "").trim();

  if (!siteName) return { error: "O nome da plataforma é obrigatório." };
  if (siteName.length > 40) return { error: "Nome muito longo (máx. 40 caracteres)." };
  if (!isValidHex(backgroundColor)) return { error: "Cor de fundo inválida." };
  if (!isValidHex(buttonColor)) return { error: "Cor do botão inválida." };

  const carouselInterval = Number(carouselIntervalRaw);
  if (!Number.isInteger(carouselInterval) || carouselInterval < 2 || carouselInterval > 60) {
    return { error: "Tempo de cada slide inválido (use um número inteiro entre 2 e 60 segundos)." };
  }

  if (referencePinterestUrl && !/^https:\/\/(www\.)?pinterest\./.test(referencePinterestUrl)) {
    return { error: "Link do Pinterest inválido — precisa começar com https://pinterest.com/ ou https://www.pinterest.com/" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: siteName,
      background_color: backgroundColor,
      button_color: buttonColor,
      carousel_interval_seconds: carouselInterval,
      reference_pinterest_url: referencePinterestUrl || null,
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
  revalidatePath("/referencias");
  return {};
}
