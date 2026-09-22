"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface FavoriteActionResult {
  error?: string;
  favorited?: boolean;
}

/** Alterna favorito: adiciona se não existir, remove se já existir. */
export async function toggleFavorite(psdId: string): Promise<FavoriteActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "not_authenticated" };
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("psd_id", psdId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) return { error: error.message };
    revalidatePath("/psd");
    revalidatePath("/favoritos");
    revalidatePath("/dashboard");
    return { favorited: false };
  }

  const { error } = await supabase.from("favorites").insert({ user_id: user.id, psd_id: psdId });
  if (error) return { error: error.message };

  revalidatePath("/psd");
  revalidatePath("/favoritos");
  revalidatePath("/dashboard");
  return { favorited: true };
}
