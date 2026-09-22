"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type CanvaResult =
  | { status: "not_authenticated" }
  | { status: "no_active_subscription" }
  | { status: "insufficient_credits"; available: number; required: number }
  | { status: "error"; message: string }
  | { status: "success"; url: string };

/**
 * Libera o template Canva de um PSD: reusa exatamente o mesmo
 * redeem_psd_credits() do fluxo de download (mesma validação de
 * assinatura/créditos, mesmo débito atômico) — só que, em vez de gerar uma
 * signed URL de Storage, devolve o canva_url já cadastrado no material.
 */
export async function openCanvaTemplate(psdId: string): Promise<CanvaResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "not_authenticated" };
  }

  const { data: download, error: rpcError } = await supabase
    .rpc("redeem_psd_credits", { p_psd_id: psdId })
    .single();

  if (rpcError) {
    const message = rpcError.message ?? "";

    if (message.includes("no_active_subscription") || message.includes("no_active_cycle")) {
      return { status: "no_active_subscription" };
    }

    if (message.includes("insufficient_credits")) {
      const detail = (rpcError as { details?: string }).details ?? "";
      const match = detail.match(/available=(-?\d+)\s+required=(\d+)/);
      return {
        status: "insufficient_credits",
        available: match ? Number(match[1]) : 0,
        required: match ? Number(match[2]) : 0,
      };
    }

    return { status: "error", message: "Não foi possível liberar o template. Tente novamente." };
  }

  if (!download) {
    return { status: "error", message: "Liberação não confirmada pelo servidor." };
  }

  const { data: psd, error: psdError } = await supabase
    .from("psd_files")
    .select("canva_url")
    .eq("id", psdId)
    .single();

  if (psdError || !psd?.canva_url) {
    return { status: "error", message: "Link do Canva não encontrado." };
  }

  revalidatePath("/meus-downloads");
  revalidatePath("/meus-creditos");
  revalidatePath("/dashboard");

  return { status: "success", url: psd.canva_url };
}
