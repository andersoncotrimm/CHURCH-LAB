import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreditsSummary {
  available: number;
  granted: number;
  used: number;
  planName: string | null;
  planId: string | null;
  periodEnd: string | null;
  subscriptionStatus: string | null;
  /** false = assinatura paga via Pix (sem débito automático) — precisa renovar manualmente antes de periodEnd. */
  autoRenews: boolean;
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
    .select("id, plan_id, status, mp_preapproval_id, plans(name)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) return null;

  const planName = (subscription as unknown as { plans: { name: string } | null }).plans?.name ?? null;
  const autoRenews = !!subscription.mp_preapproval_id;

  // Ciclo vencido pela data mas ainda "active" (só acontece em planos pagos
  // via Pix, sem cobrança automática pra fechar sozinho) conta como sem
  // ciclo — redeem_psd_credits() já faz a mesma checagem na hora de baixar.
  const { data: cycle } = await supabase
    .from("subscription_cycles")
    .select("credits_granted, credits_used, period_end")
    .eq("subscription_id", subscription.id)
    .eq("status", "active")
    .gte("period_end", new Date().toISOString())
    .maybeSingle();

  if (!cycle) {
    return {
      available: 0,
      granted: 0,
      used: 0,
      planName,
      planId: subscription.plan_id,
      periodEnd: null,
      subscriptionStatus: subscription.status,
      autoRenews,
    };
  }

  return {
    available: cycle.credits_granted - cycle.credits_used,
    granted: cycle.credits_granted,
    used: cycle.credits_used,
    planName,
    planId: subscription.plan_id,
    periodEnd: cycle.period_end,
    subscriptionStatus: subscription.status,
    autoRenews,
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
