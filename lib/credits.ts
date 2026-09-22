import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreditsSummary {
  available: number;
  granted: number;
  used: number;
  planName: string | null;
  periodEnd: string | null;
  subscriptionStatus: string | null;
}

/**
 * Resume o saldo de créditos do usuário a partir do ciclo ATIVO da
 * assinatura ativa mais recente. Retorna null se o usuário não tiver
 * assinatura ativa (usado para decidir os CTAs de "assinar"/"sem créditos").
 */
export async function getUserCreditsSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<CreditsSummary | null> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, plans(name)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) return null;

  const { data: cycle } = await supabase
    .from("subscription_cycles")
    .select("credits_granted, credits_used, period_end")
    .eq("subscription_id", subscription.id)
    .eq("status", "active")
    .maybeSingle();

  if (!cycle) {
    return {
      available: 0,
      granted: 0,
      used: 0,
      planName: (subscription as unknown as { plans: { name: string } | null }).plans?.name ?? null,
      periodEnd: null,
      subscriptionStatus: subscription.status,
    };
  }

  return {
    available: cycle.credits_granted - cycle.credits_used,
    granted: cycle.credits_granted,
    used: cycle.credits_used,
    planName: (subscription as unknown as { plans: { name: string } | null }).plans?.name ?? null,
    periodEnd: cycle.period_end,
    subscriptionStatus: subscription.status,
  };
}

export type AssetCtaState = "guest" | "no-subscription" | "insufficient" | "ready";

/** Mesma lógica de decisão de CTA usada na página de detalhes, reaproveitada nos cards/modal. */
export function computeCtaState(
  isLoggedIn: boolean,
  availableCredits: number | null,
  creditCost: number
): AssetCtaState {
  if (!isLoggedIn) return "guest";
  if (availableCredits === null) return "no-subscription";
  if (availableCredits < creditCost) return "insufficient";
  return "ready";
}
