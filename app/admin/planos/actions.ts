"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { PlanFormValues } from "@/lib/types/plan";

export interface ActionResult {
  error?: string;
}

function parsePlanForm(formData: FormData): { values: PlanFormValues } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const billingInterval = String(formData.get("billing_interval") ?? "monthly");
  const monthlyCreditsRaw = String(formData.get("monthly_credits") ?? "");
  const benefitsRaw = String(formData.get("benefits") ?? "");
  const limitsRaw = String(formData.get("limits") ?? "").trim();
  const displayOrderRaw = String(formData.get("display_order") ?? "0");
  const isFeatured = formData.get("is_featured") === "on";
  const isActive = formData.get("is_active") === "on";

  if (!name) return { error: "Nome é obrigatório." };

  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug inválido. Use apenas letras minúsculas, números e hífens." };
  }

  if (billingInterval !== "monthly" && billingInterval !== "yearly") {
    return { error: "Período de cobrança inválido." };
  }

  const price = Number(priceRaw.replace(",", "."));
  if (Number.isNaN(price) || price < 0) return { error: "Preço inválido." };

  const monthlyCredits = Number(monthlyCreditsRaw);
  if (!Number.isInteger(monthlyCredits) || monthlyCredits < 0) {
    return { error: "Quantidade de créditos inválida (use um número inteiro ≥ 0)." };
  }

  const displayOrder = Number(displayOrderRaw);
  if (!Number.isInteger(displayOrder) || displayOrder < 0) {
    return { error: "Ordem de exibição inválida (use um número inteiro ≥ 0)." };
  }

  const benefits = benefitsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let limits: Record<string, unknown> = {};
  if (limitsRaw) {
    try {
      const parsed = JSON.parse(limitsRaw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("not an object");
      }
      limits = parsed as Record<string, unknown>;
    } catch {
      return { error: 'Limites precisa ser um objeto JSON válido, ex.: {"maxDownloadsPerDay": 10}.' };
    }
  }

  return {
    values: {
      name,
      slug,
      description,
      price,
      billing_interval: billingInterval,
      monthly_credits: monthlyCredits,
      benefits,
      limits,
      display_order: displayOrder,
      is_featured: isFeatured,
      is_active: isActive,
    },
  };
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.code === "23505" || error.message.includes("duplicate key")) {
    return "Já existe um plano com esse slug para este produto.";
  }
  if (error.code === "23503") {
    return "Este plano está em uso (há assinaturas vinculadas) e não pode ser excluído. Desative-o em vez de excluir.";
  }
  if (error.message.includes("row-level security") || error.message === "permission denied for table plans") {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
}

export async function createPlan(formData: FormData): Promise<ActionResult> {
  const parsed = parsePlanForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("slug", "church-lab-assets")
    .single();

  if (productError || !product) {
    return { error: "Produto CHURCH-LAB ASSETS não encontrado. Aplique a migration de gerenciamento de planos primeiro." };
  }

  const { error } = await supabase.from("plans").insert({
    product_id: product.id,
    ...parsed.values,
  });

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/planos");
  revalidatePath("/planos");
  return {};
}

export async function updatePlan(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parsePlanForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("plans").update(parsed.values).eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/planos");
  revalidatePath("/planos");
  return {};
}

export async function togglePlanActive(id: string, nextActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("plans").update({ is_active: nextActive }).eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/planos");
  revalidatePath("/planos");
  return {};
}

export async function deletePlan(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("plans").delete().eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidatePath("/admin/planos");
  revalidatePath("/planos");
  return {};
}
