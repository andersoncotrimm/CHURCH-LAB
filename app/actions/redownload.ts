"use server";

import { createClient } from "@/utils/supabase/server";

export type RedownloadResult =
  | { status: "error"; message: string }
  | { status: "success"; url: string; fileName: string };

/**
 * Gera uma nova signed URL para um PSD que o usuário JÁ baixou antes —
 * não chama redeem_psd_credits() de novo, então não cobra créditos uma
 * segunda vez. Só funciona porque a RLS de storage.objects já libera
 * leitura para quem tem um download anterior registrado; aqui só
 * confirmamos isso explicitamente antes de gerar o link, para dar um
 * erro claro em vez de deixar a RLS falhar silenciosamente.
 */
export async function getRedownloadUrl(psdId: string): Promise<RedownloadResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Você precisa estar logado." };
  }

  const { data: existing } = await supabase
    .from("downloads")
    .select("id")
    .eq("user_id", user.id)
    .eq("psd_id", psdId)
    .limit(1)
    .maybeSingle();

  if (!existing) {
    return { status: "error", message: "Você ainda não baixou este arquivo." };
  }

  const { data: psd, error: psdError } = await supabase
    .from("psd_files")
    .select("file_path, title")
    .eq("id", psdId)
    .single();

  if (psdError || !psd) {
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
