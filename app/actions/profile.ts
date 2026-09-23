"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface ProfileActionResult {
  error?: string;
  success?: boolean;
}

export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const usernameRaw = String(formData.get("username") ?? "").trim().toLowerCase();

  if (!fullName) return { error: "Nome é obrigatório." };

  if (usernameRaw && !/^[a-z0-9._-]{3,32}$/.test(usernameRaw)) {
    return {
      error: "Usuário inválido. Use de 3 a 32 caracteres: letras minúsculas, números, ponto, hífen ou underline.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null, username: usernameRaw || null })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "Esse nome de usuário já está em uso." };
    return { error: error.message };
  }

  revalidatePath("/minha-conta");
  revalidatePath("/dashboard");
  return { success: true };
}
