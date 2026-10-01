/**
 * Busca um arquivo público do Google Drive (compartilhado como
 * "Qualquer pessoa com o link pode visualizar") e devolve os bytes
 * diretamente — sem passar pela página de visualização do Drive, que
 * é o que faria o navegador abrir o Drive em vez de baixar o arquivo.
 *
 * Arquivos grandes (PSD costuma passar de 25-100MB) fazem o Drive
 * mostrar uma página de aviso "não foi possível verificar vírus" com
 * um token de confirmação em vez do arquivo — contorna isso repetindo
 * a requisição com esse token. É o mesmo truque usado por ferramentas
 * como gdown; não é uma API oficial do Google, então pode parar de
 * funcionar se o Google mudar esse comportamento (não há contrato
 * garantido aqui).
 */

const DRIVE_ID_PATTERNS = [
  /\/file\/d\/([a-zA-Z0-9_-]+)/,
  /[?&]id=([a-zA-Z0-9_-]+)/,
  /\/d\/([a-zA-Z0-9_-]+)/,
];

export function extractDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = pattern.exec(url);
    if (match) return match[1];
  }
  return null;
}

export function isDriveUrl(url: string): boolean {
  return /^https:\/\/(drive|docs)\.google\.com\//.test(url.trim());
}

export interface DriveFetchResult {
  response: Response;
  fileName: string | null;
}

export async function fetchDriveFile(fileId: string): Promise<DriveFetchResult> {
  const baseUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  let response = await fetch(baseUrl, { redirect: "follow" });
  let cookie = response.headers.get("set-cookie") ?? undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    const html = await response.text();
    const confirmMatch = /confirm=([0-9A-Za-z_-]+)/.exec(html);

    if (confirmMatch) {
      const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
      response = await fetch(confirmUrl, {
        redirect: "follow",
        headers: cookie ? { cookie } : undefined,
      });
      cookie = response.headers.get("set-cookie") ?? cookie;
    } else {
      // Página de HTML sem token de confirmação — provavelmente o link não
      // está público ("qualquer pessoa com o link"), ou o arquivo não existe.
      throw new Error(
        "Não foi possível acessar o arquivo no Google Drive. Confirme se o link está compartilhado como \"Qualquer pessoa com o link pode visualizar\"."
      );
    }
  }

  if (!response.ok) {
    throw new Error(`O Google Drive recusou o acesso ao arquivo (status ${response.status}).`);
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const fileNameMatch = /filename="?([^";]+)"?/.exec(disposition);

  return { response, fileName: fileNameMatch?.[1] ?? null };
}
