"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { CONTENT_TYPES } from "@/lib/types/psd";
import type { ContentType } from "@/lib/types/psd";

export interface ActionResult {
  error?: string;
}

interface PsdFields {
  title: string;
  slug: string;
  description: string;
  credit_cost: number;
  dimensions: string;
  canva_url: string;
  slides_count: number | null;
  is_published: boolean;
  is_featured: boolean;
  content_type: ContentType;
  category_ids: string[];
}

function parsePsdForm(formData: FormData): { values: PsdFields } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const creditCostRaw = String(formData.get("credit_cost") ?? "");
  const dimensions = String(formData.get("dimensions") ?? "").trim();
  const canvaUrl = String(formData.get("canva_url") ?? "").trim();
  const slidesCountRaw = String(formData.get("slides_count") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const isFeatured = formData.get("is_featured") === "on";
  const contentTypeRaw = String(formData.get("content_type") ?? "psd");
  const categoryIds = formData.getAll("category_ids").map(String).filter(Boolean);

  if (!title) return { error: "Título é obrigatório." };

  if (!CONTENT_TYPES.some((type) => type.value === contentTypeRaw)) {
    return { error: "Seção inválida." };
  }
  const contentType = contentTypeRaw as ContentType;

  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug inválido. Use apenas letras minúsculas, números e hífens." };
  }

  const creditCost = Number(creditCostRaw);
  if (!Number.isInteger(creditCost) || creditCost < 0) {
    return { error: "Custo em créditos inválido (use um número inteiro ≥ 0)." };
  }

  if (canvaUrl && !/^https:\/\//.test(canvaUrl)) {
    return { error: "Link do Canva precisa começar com https://" };
  }

  let slidesCount: number | null = null;
  if (slidesCountRaw) {
    slidesCount = Number(slidesCountRaw);
    if (!Number.isInteger(slidesCount) || slidesCount < 1) {
      return { error: "Quantidade de slides inválida (use um número inteiro ≥ 1)." };
    }
  }

  return {
    values: {
      title,
      slug,
      description,
      credit_cost: creditCost,
      dimensions,
      canva_url: canvaUrl,
      slides_count: slidesCount,
      is_published: isPublished,
      is_featured: isFeatured,
      content_type: contentType,
      category_ids: categoryIds,
    },
  };
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.code === "23505" || error.message.includes("duplicate key")) {
    return "Já existe um PSD com esse slug.";
  }
  if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
}

function extensionOf(file: File, fallback: string): string {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : fallback;
}

async function syncCategoryLinks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  psdId: string,
  categoryIds: string[]
): Promise<{ error?: string }> {
  const { error: deleteError } = await supabase.from("psd_categories").delete().eq("psd_id", psdId);
  if (deleteError) return { error: translateSupabaseError(deleteError) };

  if (categoryIds.length === 0) return {};

  const { error: insertError } = await supabase
    .from("psd_categories")
    .insert(categoryIds.map((categoryId) => ({ psd_id: psdId, category_id: categoryId })));
  if (insertError) return { error: translateSupabaseError(insertError) };

  return {};
}

export async function createPsd(formData: FormData): Promise<ActionResult> {
  const parsed = parsePsdForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const originalFile = formData.get("original") as File | null;
  const hasOriginalFile = !!originalFile && originalFile.size > 0;
  const { canva_url: canvaUrl } = parsed.values;

  if (!hasOriginalFile && !canvaUrl) {
    return { error: "Envie o arquivo PSD original ou informe um link do Canva (pelo menos um dos dois)." };
  }

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const previewFile = formData.get("preview") as File | null;
  const { slug } = parsed.values;

  const supabase = await createClient();

  let originalPath: string | null = null;
  let originalExt: string | null = null;
  if (hasOriginalFile) {
    originalExt = extensionOf(originalFile!, "psd");
    originalPath = `${slug}/original.${originalExt}`;
    const { error: originalUploadError } = await supabase.storage
      .from("psd-originals")
      .upload(originalPath, originalFile!, { upsert: true, contentType: originalFile!.type || "application/octet-stream" });
    if (originalUploadError) return { error: `Falha ao enviar o arquivo PSD: ${originalUploadError.message}` };
  }

  let thumbnailUrl: string | null = null;
  if (thumbnailFile && thumbnailFile.size > 0) {
    const path = `${slug}/thumbnail.${extensionOf(thumbnailFile, "jpg")}`;
    const { error } = await supabase.storage
      .from("psd-thumbnails")
      .upload(path, thumbnailFile, { upsert: true, contentType: thumbnailFile.type || undefined });
    if (error) return { error: `Falha ao enviar a thumbnail: ${error.message}` };
    thumbnailUrl = supabase.storage.from("psd-thumbnails").getPublicUrl(path).data.publicUrl;
  }

  let previewUrl: string | null = null;
  if (previewFile && previewFile.size > 0) {
    const path = `${slug}/preview.${extensionOf(previewFile, "jpg")}`;
    const { error } = await supabase.storage
      .from("psd-previews")
      .upload(path, previewFile, { upsert: true, contentType: previewFile.type || undefined });
    if (error) return { error: `Falha ao enviar o preview: ${error.message}` };
    previewUrl = supabase.storage.from("psd-previews").getPublicUrl(path).data.publicUrl;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("psd_files")
    .insert({
      title: parsed.values.title,
      slug: parsed.values.slug,
      description: parsed.values.description || null,
      thumbnail_url: thumbnailUrl,
      preview_url: previewUrl,
      file_path: originalPath,
      file_size: hasOriginalFile ? originalFile!.size : null,
      file_format: originalExt ? originalExt.toUpperCase() : null,
      dimensions: parsed.values.dimensions || null,
      canva_url: canvaUrl || null,
      slides_count: parsed.values.slides_count,
      credit_cost: parsed.values.credit_cost,
      is_published: parsed.values.is_published,
      is_featured: parsed.values.is_featured,
      content_type: parsed.values.content_type,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: translateSupabaseError(insertError ?? { message: "Erro desconhecido ao criar o PSD." }) };
  }

  const linkResult = await syncCategoryLinks(supabase, inserted.id, parsed.values.category_ids);
  if (linkResult.error) return linkResult;

  revalidatePath("/admin/psd");
  revalidatePath("/psd");
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  revalidatePath("/categorias");
  revalidatePath("/dashboard");
  return {};
}

export async function updatePsd(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parsePsdForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("psd_files")
    .select("file_path, file_size, file_format, thumbnail_url, preview_url")
    .eq("id", id)
    .single();

  if (fetchError || !existing) return { error: "PSD não encontrado." };

  const { slug, canva_url: canvaUrl } = parsed.values;
  const originalFile = formData.get("original") as File | null;
  const thumbnailFile = formData.get("thumbnail") as File | null;
  const previewFile = formData.get("preview") as File | null;

  let filePath = existing.file_path;
  let fileSize = existing.file_size;
  let fileFormat = existing.file_format;
  if (originalFile && originalFile.size > 0) {
    const ext = extensionOf(originalFile, "psd");
    filePath = `${slug}/original.${ext}`;
    const { error } = await supabase.storage
      .from("psd-originals")
      .upload(filePath, originalFile, { upsert: true, contentType: originalFile.type || "application/octet-stream" });
    if (error) return { error: `Falha ao enviar o arquivo PSD: ${error.message}` };
    fileSize = originalFile.size;
    fileFormat = ext.toUpperCase();
  }

  if (!filePath && !canvaUrl) {
    return { error: "O PSD precisa ter o arquivo original ou um link do Canva (pelo menos um dos dois)." };
  }

  let thumbnailUrl = existing.thumbnail_url;
  if (thumbnailFile && thumbnailFile.size > 0) {
    const path = `${slug}/thumbnail.${extensionOf(thumbnailFile, "jpg")}`;
    const { error } = await supabase.storage
      .from("psd-thumbnails")
      .upload(path, thumbnailFile, { upsert: true, contentType: thumbnailFile.type || undefined });
    if (error) return { error: `Falha ao enviar a thumbnail: ${error.message}` };
    thumbnailUrl = supabase.storage.from("psd-thumbnails").getPublicUrl(path).data.publicUrl;
  }

  let previewUrl = existing.preview_url;
  if (previewFile && previewFile.size > 0) {
    const path = `${slug}/preview.${extensionOf(previewFile, "jpg")}`;
    const { error } = await supabase.storage
      .from("psd-previews")
      .upload(path, previewFile, { upsert: true, contentType: previewFile.type || undefined });
    if (error) return { error: `Falha ao enviar o preview: ${error.message}` };
    previewUrl = supabase.storage.from("psd-previews").getPublicUrl(path).data.publicUrl;
  }

  const { error: updateError } = await supabase
    .from("psd_files")
    .update({
      title: parsed.values.title,
      slug: parsed.values.slug,
      description: parsed.values.description || null,
      thumbnail_url: thumbnailUrl,
      preview_url: previewUrl,
      file_path: filePath,
      file_size: fileSize,
      file_format: fileFormat,
      dimensions: parsed.values.dimensions || null,
      canva_url: canvaUrl || null,
      slides_count: parsed.values.slides_count,
      credit_cost: parsed.values.credit_cost,
      is_published: parsed.values.is_published,
      is_featured: parsed.values.is_featured,
      content_type: parsed.values.content_type,
    })
    .eq("id", id);

  if (updateError) return { error: translateSupabaseError(updateError) };

  const linkResult = await syncCategoryLinks(supabase, id, parsed.values.category_ids);
  if (linkResult.error) return linkResult;

  revalidatePath("/admin/psd");
  revalidatePath("/psd");
  revalidatePath(`/psd/${slug}`);
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  revalidatePath("/categorias");
  revalidatePath("/dashboard");
  return {};
}

export async function togglePsdPublished(id: string, nextPublished: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("psd_files").update({ is_published: nextPublished }).eq("id", id);
  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/psd");
  revalidatePath("/psd");
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  revalidatePath("/dashboard");
  return {};
}

export async function deletePsd(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("psd_files").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return { error: "Este PSD já foi baixado por usuários e não pode ser excluído. Despublique-o em vez de excluir." };
    }
    return { error: translateSupabaseError(error) };
  }

  revalidatePath("/admin/psd");
  revalidatePath("/psd");
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  revalidatePath("/categorias");
  revalidatePath("/dashboard");
  return {};
}
