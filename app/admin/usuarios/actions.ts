"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface ActionResult {
  error?: string;
}

function translateError(message: string): string {
  if (message.includes("not_admin")) return "Você não tem permissão de administrador para esta ação.";
  if (message.includes("plan_not_found")) return "Plano não encontrado.";
  if (message.includes("user_not_found")) return "Usuário não encontrado.";
  if (message.includes("cannot_remove_self_admin")) return "Você não pode remover o próprio acesso de admin.";
  if (message.includes("invalid_period_days")) return "Duração do período inválida.";
  return message;
}

export async function grantSubscription(userId: string, planId: string, periodDays = 30): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_grant_subscription", {
    p_user_id: userId,
    p_plan_id: planId,
    p_period_days: periodDays,
  });

  if (error) return { error: translateError(error.message) };

  revalidatePath("/admin/usuarios");
  return {};
}

export async function setUserAdmin(userId: string, isAdmin: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_user_admin", {
    p_user_id: userId,
    p_is_admin: isAdmin,
  });

  if (error) return { error: translateError(error.message) };

  revalidatePath("/admin/usuarios");
  return {};
}
