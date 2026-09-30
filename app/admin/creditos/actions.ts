"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { CreditPackageFormValues } from "@/lib/types/credit-package";

export interface ActionResult {
  error?: string;
}

function parseCreditPackageForm(formData: FormData): { values: CreditPackageFormValues } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const creditsAmountRaw = String(formData.get("credits_amount") ?? "");
  const priceRaw = String(formData.get("price") ?? "");
  const sortOrderRaw = String(formData.get("sort_order") ?? "0");
  const isActive = formData.get("is_active") === "on";

  if (!name) return { error: "Nome é obrigatório." };

  const creditsAmount = Number(creditsAmountRaw);
  if (!Number.isInteger(creditsAmount) || creditsAmount <= 0) {
    return { error: "Quantidade de créditos inválida (use um número inteiro maior que 0)." };
  }

  const price = Number(priceRaw.replace(",", "."));
  if (Number.isNaN(price) || price < 0) return { error: "Preço inválido." };

  const sortOrder = Number(sortOrderRaw);
  if (!Number.isInteger(sortOrder) || sortOrder < 0) return { error: "Ordem inválida." };

  return { values: { name, credits_amount: creditsAmount, price, sort_order: sortOrder, is_active: isActive } };
}

function translateSupabaseError(error: { message: string; code?: string }): string {
  if (error.message.includes("row-level security") || error.message.includes("permission denied")) {
    return "Você não tem permissão de administrador para esta ação.";
  }
  return error.message;
}

function revalidateCreditPaths() {
  revalidatePath("/admin/creditos");
  revalidatePath("/meus-creditos");
}

export async function createCreditPackage(formData: FormData): Promise<ActionResult> {
  const parsed = parseCreditPackageForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("credit_packages").insert(parsed.values);

  if (error) return { error: translateSupabaseError(error) };

  revalidateCreditPaths();
  return {};
}

export async function updateCreditPackage(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseCreditPackageForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("credit_packages").update(parsed.values).eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidateCreditPaths();
  return {};
}

export async function toggleCreditPackageActive(id: string, nextActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("credit_packages").update({ is_active: nextActive }).eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidateCreditPaths();
  return {};
}

export async function deleteCreditPackage(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("credit_packages").delete().eq("id", id);

  if (error) return { error: translateSupabaseError(error) };

  revalidateCreditPaths();
  return {};
}
