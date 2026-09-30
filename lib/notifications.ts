import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cria uma notificação se o tipo estiver ativo em site_settings — nunca
 * lança erro (uma falha aqui não pode derrubar a action principal que a
 * chamou, ex.: criar um PSD tem que funcionar mesmo se a notificação
 * falhar por algum motivo).
 */
export async function notifyIfEnabled(
  supabase: SupabaseClient,
  type: "new_file" | "platform_update",
  message: string
): Promise<void> {
  try {
    const column = type === "new_file" ? "notify_new_files" : "notify_platform_updates";
    const { data: settings } = await supabase.from("site_settings").select(column).eq("id", true).maybeSingle();
    const enabled = settings ? (settings as Record<string, boolean>)[column] !== false : true;
    if (!enabled) return;

    await supabase.from("notifications").insert({ type, message });
  } catch {
    // silencioso — notificação é um extra, nunca deve quebrar a action principal
  }
}
