"use client";

/**
 * Redimensiona e comprime uma imagem no navegador antes do upload —
 * fotos de fundo em resolução/tamanho original (várias vezes maiores
 * que o necessário pra cobrir a tela) demoravam muito pra baixar,
 * deixando a página mostrando só o fundo por um bom tempo enquanto o
 * resto carregava. Sempre sai como JPEG (fundo é foto, não precisa de
 * transparência, e JPEG fica muito menor que PNG pra esse tipo de imagem).
 */
export async function resizeImageForUpload(file: File, maxDimension = 2000, quality = 0.8): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Qualquer falha (formato não suportado, navegador sem createImageBitmap
    // etc.) — sobe o arquivo original em vez de travar o envio.
    return file;
  }
}
