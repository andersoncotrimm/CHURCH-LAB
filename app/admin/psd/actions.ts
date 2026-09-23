"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { slugify } from "@/lib/slugify";
import { CONTENT_TYPES } from "@/lib/types/psd";
import type { ContentType } from "@/lib/types/psd";

export interface ActionResult {
  error?: string;
}

// Nada aqui é obrigatório além do título — os arquivos (thumbnail, preview,
// PSD original) já sobem direto do navegador pro Storage (ver
// components/admin/psd-form-modal.tsx) ANTES desta action ser chamada, por
// isso ela só recebe texto/URLs/paths, nunca File. Isso evita o limite de
// tamanho de payload das Server Actions na Vercel, que travava upload de
// PSDs reais (geralmente maiores que alguns MB) sem mostrar erro nenhum.
interface PsdFields {
  title: string;
  slug: string;
  description: string;
  credit_cost: number;
  dimensions: string;
  canva_url: string;
  youtube_url: string;
  slides_count: number | null;
  is_published: boolean;
  is_featured: boolean;
  content_type: ContentType;
  category_ids: string[];
  thumbnail_url: string;
  preview_url: string;
  file_path: string;
  file_size: number | null;
  file_format: string;
}

function parsePsdForm(formData: FormData): { values: PsdFields } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Nome é obrigatório." };

  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugRaw) ? slugRaw : slugify(title);
  if (!slug) return { error: "Não foi possível gerar uma URL a partir do nome. Tente um nome diferente." };

  const description = String(formData.get("description") ?? "").trim();
  const dimensions = String(formData.get("dimensions") ?? "").trim();
  const canvaUrl = String(formData.get("canva_url") ?? "").trim();
  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const isFeatured = formData.get("is_featured") === "on";
  const categoryIds = formData.getAll("category_ids").map(String).filter(Boolean);

  const contentTypeRaw = String(formData.get("content_type") ?? "psd");
  const contentType = CONTENT_TYPES.some((type) => type.value === contentTypeRaw)
    ? (contentTypeRaw as ContentType)
    : "psd";

  const creditCostRaw = String(formData.get("credit_cost") ?? "");
  const creditCostParsed = Number(creditCostRaw);
  const creditCost = Number.isInteger(creditCostParsed) && creditCostParsed >= 0 ? creditCostParsed : 0;

  const slidesCountRaw = String(formData.get("slides_count") ?? "").trim();
  const slidesCountParsed = Number(slidesCountRaw);
  const slidesCount = slidesCountRaw && Number.isInteger(slidesCountParsed) && slidesCountParsed >= 1
    ? slidesCountParsed
    : null;

  const fileSizeRaw = String(formData.get("file_size") ?? "").trim();
  const fileSizeParsed = Number(fileSizeRaw);
  const fileSize = fileSizeRaw && Number.isFinite(fileSizeParsed) ? fileSizeParsed : null;

  return {
    values: {
      title,
      slug,
      description,
      credit_cost: creditCost,
      dimensions,
      // Só guarda link do Canva/YouTube se realmente parecer um link —
      // senão ignora em silêncio em vez de bloquear o salvamento inteiro.
      canva_url: /^https:\/\//.test(canvaUrl) ? canvaUrl : "",
      youtube_url: /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(youtubeUrl) ? youtubeUrl : "",
      slides_count: slidesCount,
      is_published: isPublished,
      is_featured: isFeatured,
      content_type: contentType,
      category_ids: categoryIds,
      thumbnail_url: String(formData.get("thumbnail_url") ?? "").trim(),
      preview_url: String(formData.get("preview_url") ?? "").trim(),
      file_path: String(formData.get("file_path") ?? "").trim(),
      file_size: fileSize,
      file_format: String(formData.get("file_format") ?? "").trim(),
    },
  };
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.code === "23505" || error.message.includes("duplicate key")) {
    return "Já existe um PSD com essa URL (slug). Mude um pouco o nome e tente de novo.";
  }
  if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
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

function revalidateLibraryPaths(slug?: string) {
  revalidatePath("/admin/psd");
  revalidatePath("/psd");
  if (slug) revalidatePath(`/psd/${slug}`);
  revalidatePath("/elementos");
  revalidatePath("/plugins");
  revalidatePath("/ferramentas");
  revalidatePath("/sistemas");
  revalidatePath("/categorias");
  revalidatePath("/dashboard");
}

export async function createPsd(formData: FormData): Promise<ActionResult> {
  const parsed = parsePsdForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const v = parsed.values;

  const supabase = await createClient();

  const { data: inserted, error: insertError } = await supabase
    .from("psd_files")
    .insert({
      title: v.title,
      slug: v.slug,
      description: v.description || null,
      thumbnail_url: v.thumbnail_url || null,
      preview_url: v.preview_url || null,
      file_path: v.file_path || null,
      file_size: v.file_size,
      file_format: v.file_format ? v.file_format.toUpperCase() : null,
      dimensions: v.dimensions || null,
      canva_url: v.canva_url || null,
      youtube_url: v.youtube_url || null,
      slides_count: v.slides_count,
      credit_cost: v.credit_cost,
      is_published: v.is_published,
      is_featured: v.is_featured,
      content_type: v.content_type,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: translateSupabaseError(insertError ?? { message: "Erro desconhecido ao criar o PSD." }) };
  }

  const linkResult = await syncCategoryLinks(supabase, inserted.id, v.category_ids);
  if (linkResult.error) return linkResult;

  revalidateLibraryPaths(v.slug);
  return {};
}

export async function updatePsd(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parsePsdForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const v = parsed.values;

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("psd_files")
    .update({
      title: v.title,
      slug: v.slug,
      description: v.description || null,
      thumbnail_url: v.thumbnail_url || null,
      preview_url: v.preview_url || null,
      file_path: v.file_path || null,
      file_size: v.file_size,
      file_format: v.file_format ? v.file_format.toUpperCase() : null,
      dimensions: v.dimensions || null,
      canva_url: v.canva_url || null,
      youtube_url: v.youtube_url || null,
      slides_count: v.slides_count,
      credit_cost: v.credit_cost,
      is_published: v.is_published,
      is_featured: v.is_featured,
      content_type: v.content_type,
    })
    .eq("id", id);

  if (updateError) return { error: translateSupabaseError(updateError) };

  const linkResult = await syncCategoryLinks(supabase, id, v.category_ids);
  if (linkResult.error) return linkResult;

  revalidateLibraryPaths(v.slug);
  return {};
}

export async function togglePsdPublished(id: string, nextPublished: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("psd_files").update({ is_published: nextPublished }).eq("id", id);
  if (error) return { error: translateSupabaseError(error) };

  revalidateLibraryPaths();
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

  revalidateLibraryPaths();
  return {};
}
