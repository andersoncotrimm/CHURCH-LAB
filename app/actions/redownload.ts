"use server";

import { createClient } from "@/utils/supabase/server";
import { REDOWNLOAD_WINDOW_DAYS } from "@/lib/download-constants";

export type RedownloadResult =
  | { status: "error"; message: string }
  | { status: "success"; url: string; fileName: string };

/**
 * Gera uma nova signed URL para um PSD que o usuário JÁ baixou antes, nos
 * últimos REDOWNLOAD_WINDOW_DAYS dias — não chama redeem_psd_credits() de
 * novo, então não cobra créditos uma segunda vez. Passada a janela, pede
 * pra usar o botão de download normal (que aí sim cobra de novo).
 */
export async function getRedownloadUrl(psdId: string): Promise<RedownloadResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Você precisa estar logado." };
  }

  const windowStart = new Date(Date.now() - REDOWNLOAD_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("downloads")
    .select("id")
    .eq("user_id", user.id)
    .eq("psd_id", psdId)
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existing) {
    return {
      status: "error",
      message: `O prazo de ${REDOWNLOAD_WINDOW_DAYS} dias pra baixar de novo sem gastar crédito já passou. Baixe pela página do material.`,
    };
  }

  const { data: psd, error: psdError } = await supabase
    .from("psd_files")
    .select("file_path, title")
    .eq("id", psdId)
    .single();

  if (psdError || !psd?.file_path) {
    return { status: "error", message: "Arquivo não encontrado." };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("psd-originals")
    .createSignedUrl(psd.file_path, 120);

  if (signError || !signed) {
    return { status: "error", message: "Não foi possível gerar o link de download." };
  }

  return { status: "success", url: signed.signedUrl, fileName: `${psd.title}.psd` };
}
