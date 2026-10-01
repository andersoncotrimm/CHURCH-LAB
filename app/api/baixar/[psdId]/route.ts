import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { extractDriveFileId, fetchDriveFile } from "@/lib/google-drive-download";

// Arquivos de PSD reais costumam ser grandes — dá mais tempo pro streaming
// terminar antes do limite de duração da função na Vercel. Mesmo assim, um
// arquivo muito grande/lento pode esbarrar no limite do plano contratado.
export const maxDuration = 300;

/**
 * Proxy de download direto para PSDs guardados no Google Drive do admin.
 * Nunca redireciona para o Drive nem expõe a página de visualização dele —
 * busca os bytes do arquivo no servidor e devolve como anexo, exatamente
 * como um download normal do Supabase Storage.
 *
 * A cobrança de créditos já aconteceu em downloadPsd()/getRedownloadUrl()
 * (Server Actions) antes do navegador chegar nesta rota — aqui só
 * confirmamos que existe um registro de download liberado para este
 * usuário+PSD, como uma segunda trava, antes de buscar o arquivo.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ psdId: string }> }) {
  const { psdId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }

  const { data: download } = await supabase
    .from("downloads")
    .select("id")
    .eq("user_id", user.id)
    .eq("psd_id", psdId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!download) {
    return NextResponse.json({ error: "Você ainda não tem acesso de download para este arquivo." }, { status: 403 });
  }

  const { data: psd, error: psdError } = await supabase
    .from("psd_files")
    .select("drive_file_url, title")
    .eq("id", psdId)
    .single();

  if (psdError || !psd?.drive_file_url) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const fileId = extractDriveFileId(psd.drive_file_url);
  if (!fileId) {
    return NextResponse.json({ error: "Link do Google Drive inválido." }, { status: 422 });
  }

  try {
    const { response, fileName } = await fetchDriveFile(fileId);

    if (!response.body) {
      return NextResponse.json({ error: "O Google Drive não retornou o arquivo." }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    const downloadName = fileName || `${psd.title}.psd`;

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadName.replace(/"/g, "")}"`,
        ...(response.headers.get("content-length")
          ? { "Content-Length": response.headers.get("content-length")! }
          : {}),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível baixar o arquivo do Google Drive.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
