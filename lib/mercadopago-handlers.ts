import type { SupabaseClient } from "@supabase/supabase-js";
import { getPayment, getPreapproval, getAuthorizedPayment } from "@/lib/mercadopago";

/**
 * Lógica de processamento de cada tipo de notificação do Mercado Pago.
 * Recebe sempre um cliente Supabase com a service_role key (ignora RLS) —
 * quem chama (app/api/webhooks/mercadopago/route.ts) já validou a
 * assinatura da requisição antes de chegar aqui.
 *
 * Todas as funções são idempotentes: o Mercado Pago pode reenviar a mesma
 * notificação várias vezes, e processar duas vezes não pode duplicar
 * crédito nem assinatura.
 */

// ---------------------------------------------------------------------------
// Pagamento avulso (Checkout Pro / "payment") — pode ser créditos extras OU
// um plano pago via Pix (um ciclo por vez, ver handlePixPlanPayment).
// external_reference aponta pra credit_purchases OU subscription_checkouts
// dependendo de qual fluxo gerou a cobrança; tenta os dois.
// ---------------------------------------------------------------------------

export async function handlePayment(supabase: SupabaseClient, paymentId: string): Promise<void> {
  const payment = await getPayment(paymentId);
  if (payment.status !== "approved") return;

  const referenceId = payment.external_reference;
  if (!referenceId) return;

  const handledAsCreditPurchase = await handleCreditPurchasePayment(supabase, referenceId, payment.id);
  if (handledAsCreditPurchase) return;

  await handlePixPlanPayment(supabase, referenceId, payment.id);
}

/** Retorna true se referenceId pertence a credit_purchases (processado ou não — só indica que achou a linha certa). */
async function handleCreditPurchasePayment(
  supabase: SupabaseClient,
  purchaseId: string,
  mpPaymentId: number
): Promise<boolean> {
  const { data: purchase } = await supabase
    .from("credit_purchases")
    .select("id, user_id, credits_amount, status")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!purchase) return false;
  if (purchase.status !== "pending") return true;

  // Só marca approved se ainda estiver pending — evita duas notificações
  // concorrentes creditarem duas vezes.
  const { data: updated, error: updateError } = await supabase
    .from("credit_purchases")
    .update({ status: "approved", mp_payment_id: String(mpPaymentId), updated_at: new Date().toISOString() })
    .eq("id", purchase.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError) {
    if (updateError.code === "23505") return true; // mp_payment_id já usado por outra notificação
    throw updateError;
  }
  if (!updated) return true;

  await grantBonusCredits(
    supabase,
    purchase.user_id,
    purchase.credits_amount,
    `Compra de ${purchase.credits_amount} créditos extras`
  );
  return true;
}

/** Plano pago via Pix: cobrança avulsa (não recorrente) que ativa um ciclo igual à autorização de uma assinatura por cartão. */
async function handlePixPlanPayment(supabase: SupabaseClient, checkoutId: string, mpPaymentId: number): Promise<void> {
  const { data: checkout } = await supabase
    .from("subscription_checkouts")
    .select("id, user_id, plan_id, status, payment_method")
    .eq("id", checkoutId)
    .maybeSingle();

  if (!checkout || checkout.payment_method !== "pix" || checkout.status !== "pending") return;

  const { data: updated, error: updateError } = await supabase
    .from("subscription_checkouts")
    .update({ status: "authorized", mp_payment_id: String(mpPaymentId), updated_at: new Date().toISOString() })
    .eq("id", checkout.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError) {
    if (updateError.code === "23505") return;
    throw updateError;
  }
  if (!updated) return;

  await activateSubscription(supabase, checkout.user_id, checkout.plan_id, null);
}

async function grantBonusCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    console.error(`[mercadopago] ${amount} créditos extras pagos mas usuário ${userId} não tem assinatura ativa.`);
    return;
  }

  const { data: cycle } = await supabase
    .from("subscription_cycles")
    .select("id, credits_granted")
    .eq("subscription_id", subscription.id)
    .eq("status", "active")
    .maybeSingle();

  if (!cycle) {
    console.error(`[mercadopago] ${amount} créditos extras pagos mas assinatura ${subscription.id} não tem ciclo ativo.`);
    return;
  }

  const { error: cycleError } = await supabase
    .from("subscription_cycles")
    .update({ credits_granted: cycle.credits_granted + amount })
    .eq("id", cycle.id);
  if (cycleError) throw cycleError;

  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    subscription_cycle_id: cycle.id,
    amount,
    transaction_type: "bonus",
    description,
  });
  if (txError) throw txError;
}

// ---------------------------------------------------------------------------
// Assinatura de plano (Preapproval)
// ---------------------------------------------------------------------------

export async function handlePreapproval(supabase: SupabaseClient, preapprovalId: string): Promise<void> {
  const preapproval = await getPreapproval(preapprovalId);
  const checkoutId = preapproval.external_reference;
  if (!checkoutId) return;

  const { data: checkout } = await supabase
    .from("subscription_checkouts")
    .select("id, user_id, plan_id, status")
    .eq("id", checkoutId)
    .maybeSingle();

  if (!checkout) return;

  if (preapproval.status === "authorized") {
    if (checkout.status !== "authorized") {
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("mp_preapproval_id", preapprovalId)
        .maybeSingle();

      if (!existingSub) {
        await activateSubscription(supabase, checkout.user_id, checkout.plan_id, preapprovalId);
      }

      await supabase
        .from("subscription_checkouts")
        .update({ status: "authorized", mp_preapproval_id: preapprovalId, updated_at: new Date().toISOString() })
        .eq("id", checkout.id);
    }
  } else if (preapproval.status === "cancelled" || preapproval.status === "paused") {
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancel_at_period_end: true })
      .eq("mp_preapproval_id", preapprovalId);

    await supabase
      .from("subscription_checkouts")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", checkout.id);
  }
}

async function activateSubscription(
  supabase: SupabaseClient,
  userId: string,
  planId: string,
  preapprovalId: string | null
): Promise<void> {
  const { data: plan } = await supabase.from("plans").select("*").eq("id", planId).single();
  if (!plan) throw new Error(`Plano ${planId} não encontrado ao ativar assinatura (preapproval=${preapprovalId ?? "pix"}).`);

  // Troca de plano: fecha qualquer assinatura/ciclo ativo anterior do
  // usuário antes de abrir o novo (nunca duas assinaturas ativas ao mesmo
  // tempo).
  const { data: previousActive } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (previousActive) {
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancel_at_period_end: false })
      .eq("id", previousActive.id);
    await supabase
      .from("subscription_cycles")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("subscription_id", previousActive.id)
      .eq("status", "active");
  }

  const periodStart = new Date();
  const periodEnd = addInterval(periodStart, plan.billing_interval);

  const { data: newSub, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      plan_id: planId,
      status: "active",
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      mp_preapproval_id: preapprovalId,
    })
    .select("id")
    .single();
  if (subError) throw subError;

  const { data: newCycle, error: cycleError } = await supabase
    .from("subscription_cycles")
    .insert({
      subscription_id: newSub.id,
      user_id: userId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      credits_granted: plan.monthly_credits,
      status: "active",
    })
    .select("id")
    .single();
  if (cycleError) throw cycleError;

  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    subscription_cycle_id: newCycle.id,
    amount: plan.monthly_credits,
    transaction_type: "grant",
    description: `Créditos do plano ${plan.name}`,
  });
  if (txError) throw txError;
}

function addInterval(date: Date, billingInterval: string): Date {
  const next = new Date(date);
  if (billingInterval === "yearly") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  return next;
}

// ---------------------------------------------------------------------------
// Renovação (cobrança recorrente de uma assinatura já ativa)
// ---------------------------------------------------------------------------

export async function handleAuthorizedPayment(supabase: SupabaseClient, authorizedPaymentId: string): Promise<void> {
  const authorizedPayment = await getAuthorizedPayment(authorizedPaymentId);
  if (authorizedPayment.status !== "processed" && authorizedPayment.status !== "approved") return;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, user_id, plan_id, status")
    .eq("mp_preapproval_id", authorizedPayment.preapproval_id)
    .maybeSingle();

  if (!subscription || subscription.status !== "active") return;

  // Idempotência: cada cobrança recorrente só processa uma vez. O índice
  // único em mp_payment_id garante isso mesmo sob notificações concorrentes.
  const { data: inserted, error: renewalError } = await supabase
    .from("subscription_renewals")
    .insert({ subscription_id: subscription.id, mp_payment_id: String(authorizedPayment.id) })
    .select("id")
    .maybeSingle();

  if (renewalError) {
    if (renewalError.code === "23505") return;
    throw renewalError;
  }
  if (!inserted) return;

  const { data: activeCycle } = await supabase
    .from("subscription_cycles")
    .select("id, period_end")
    .eq("subscription_id", subscription.id)
    .eq("status", "active")
    .maybeSingle();

  // Se o ciclo ativo ainda não venceu, esta notificação é da cobrança
  // inicial (já tratada em activateSubscription ao autorizar a preapproval)
  // — não abre um ciclo novo em cima do que acabou de ser criado.
  if (activeCycle && new Date(activeCycle.period_end) > new Date()) return;

  const { data: plan } = await supabase.from("plans").select("*").eq("id", subscription.plan_id).single();
  if (!plan) throw new Error(`Plano ${subscription.plan_id} não encontrado pra renovar assinatura ${subscription.id}.`);

  if (activeCycle) {
    await supabase
      .from("subscription_cycles")
      .update({ status: "expired", closed_at: new Date().toISOString() })
      .eq("id", activeCycle.id);
  }

  const periodStart = new Date();
  const periodEnd = addInterval(periodStart, plan.billing_interval);

  const { data: newCycle, error: cycleError } = await supabase
    .from("subscription_cycles")
    .insert({
      subscription_id: subscription.id,
      user_id: subscription.user_id,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      credits_granted: plan.monthly_credits,
      status: "active",
    })
    .select("id")
    .single();
  if (cycleError) throw cycleError;

  const { error: subUpdateError } = await supabase
    .from("subscriptions")
    .update({ current_period_start: periodStart.toISOString(), current_period_end: periodEnd.toISOString() })
    .eq("id", subscription.id);
  if (subUpdateError) throw subUpdateError;

  const { error: txError } = await supabase.from("credit_transactions").insert({
    user_id: subscription.user_id,
    subscription_cycle_id: newCycle.id,
    amount: plan.monthly_credits,
    transaction_type: "grant",
    description: `Renovação do plano ${plan.name}`,
  });
  if (txError) throw txError;
}
