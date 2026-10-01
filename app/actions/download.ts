"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { REDOWNLOAD_WINDOW_DAYS } from "@/lib/download-constants";

export type DownloadResult =
  | { status: "not_authenticated" }
  | { status: "no_active_subscription" }
  | { status: "insufficient_credits"; available: number; required: number }
  | { status: "error"; message: string }
  | { status: "success"; url: string; fileName: string };

/**
 * Download seguro de um PSD:
 * 1) se a pessoa já baixou este mesmo PSD há no máximo REDOWNLOAD_WINDOW_DAYS
 *    dias, pula a cobrança — é o mesmo download "de graça" de novo, só
 *    gera uma nova signed URL;
 * 2) senão, chama a função SECURITY DEFINER redeem_psd_credits() já
 *    existente no Supabase — valida autenticação, assinatura ativa, ciclo
 *    ativo e saldo suficiente, e debita os créditos atomicamente (com lock
 *    de linha), criando um novo registro (que reinicia a janela de 7 dias);
 * 3) só então gera uma signed URL do arquivo original, que só funciona
 *    porque a RLS de storage.objects libera leitura para quem tem um
 *    registro correspondente em public.downloads (criado no passo 2).
 * Nenhum arquivo é servido sem passar por essa checagem — não existe
 * "download" no frontend que não seja este fluxo.
 */
export async function downloadPsd(psdId: string): Promise<DownloadResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "not_authenticated" };
  }

  const windowStart = new Date(Date.now() - REDOWNLOAD_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentDownload } = await supabase
    .from("downloads")
    .select("id")
    .eq("user_id", user.id)
    .eq("psd_id", psdId)
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!recentDownload) {
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

      return { status: "error", message: "Não foi possível concluir o download. Tente novamente." };
    }

    if (!download) {
      return { status: "error", message: "Download não confirmado pelo servidor." };
    }
  }

  const { data: psd, error: psdError } = await supabase
    .from("psd_files")
    .select("file_path, drive_file_url, title")
    .eq("id", psdId)
    .single();

  if (psdError || (!psd?.file_path && !psd?.drive_file_url)) {
    return { status: "error", message: "Arquivo não encontrado." };
  }

  revalidatePath("/meus-downloads");
  revalidatePath("/meus-creditos");
  revalidatePath("/dashboard");

  // Arquivo guardado no Google Drive do admin: a URL aponta pra nossa
  // própria rota (/api/baixar), que busca os bytes do Drive e entrega como
  // download direto — o usuário nunca vê a página do Drive.
  if (psd.drive_file_url) {
    return { status: "success", url: `/api/baixar/${psdId}`, fileName: `${psd.title}.psd` };
  }

  // file_path guarda o caminho DENTRO do bucket "psd-originals" (sem o
  // prefixo do bucket) — é exatamente o que storage.objects.name compara
  // na policy de leitura protegida.
  const { data: signed, error: signError } = await supabase.storage
    .from("psd-originals")
    .createSignedUrl(psd.file_path!, 120);

  if (signError || !signed) {
    return { status: "error", message: "Não foi possível gerar o link de download." };
  }

  return { status: "success", url: signed.signedUrl, fileName: `${psd.title}.psd` };
}
