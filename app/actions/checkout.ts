"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSiteOrigin } from "@/lib/site-url";
import { getSiteSettings } from "@/lib/settings";
import { createPaymentPreference, createPreapproval } from "@/lib/mercadopago";

export interface CheckoutResult {
  error?: string;
}

const CUSTOM_CREDIT_MIN = 10;
const CUSTOM_CREDIT_MAX = 2000;

/**
 * Cria uma assinatura pendente (Preapproval) no Mercado Pago pro plano
 * escolhido e redireciona pro checkout hospedado por eles. A assinatura só
 * vira real (linha em subscriptions + primeiro ciclo de créditos) quando o
 * webhook confirma que o pagamento foi autorizado — ver
 * lib/mercadopago-handlers.ts.
 */
export async function startPlanCheckout(planId: string): Promise<CheckoutResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Você precisa estar logado com um e-mail válido pra assinar um plano." };
  }

  const { data: plan } = await supabase.from("plans").select("*").eq("id", planId).eq("is_active", true).maybeSingle();
  if (!plan) return { error: "Plano não encontrado." };

  if (plan.price <= 0) {
    return { error: "Este plano não tem cobrança automática configurada. Fale com o suporte." };
  }

  const { data: checkout, error: checkoutError } = await supabase
    .from("subscription_checkouts")
    .insert({ user_id: user.id, plan_id: plan.id, status: "pending", payment_method: "card" })
    .select("id")
    .single();

  if (checkoutError || !checkout) {
    return { error: "Não foi possível iniciar a assinatura. Tente novamente." };
  }

  const origin = await getSiteOrigin();

  let preapproval;
  try {
    preapproval = await createPreapproval({
      reason: `Assinatura ${plan.name} — CHURCH-LAB`,
      externalReference: checkout.id,
      payerEmail: user.email,
      backUrl: `${origin}/planos?checkout=sucesso`,
      frequency: plan.billing_interval === "yearly" ? 12 : 1,
      transactionAmount: plan.price,
    });
  } catch (error) {
    console.error("Falha ao criar assinatura no Mercado Pago:", error);
    return { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." };
  }

  await supabase.from("subscription_checkouts").update({ mp_preapproval_id: preapproval.id }).eq("id", checkout.id);

  redirect(preapproval.init_point);
}

/**
 * Cobra UM ciclo do plano via Pix (cobrança avulsa, não recorrente — o
 * Mercado Pago não tem débito automático via Pix). O plano fica ativo até
 * o fim do período pago; pra continuar depois disso, a pessoa paga de novo
 * (ver banner de renovação em /meus-creditos). Vira plano ativo de verdade
 * quando o webhook confirma o pagamento aprovado — ver
 * lib/mercadopago-handlers.ts.
 */
export async function startPlanPixCheckout(planId: string): Promise<CheckoutResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Você precisa estar logado com um e-mail válido pra assinar um plano." };
  }

  const { data: plan } = await supabase.from("plans").select("*").eq("id", planId).eq("is_active", true).maybeSingle();
  if (!plan) return { error: "Plano não encontrado." };

  if (plan.price <= 0) {
    return { error: "Este plano não tem cobrança automática configurada. Fale com o suporte." };
  }

  const { data: checkout, error: checkoutError } = await supabase
    .from("subscription_checkouts")
    .insert({ user_id: user.id, plan_id: plan.id, status: "pending", payment_method: "pix" })
    .select("id")
    .single();

  if (checkoutError || !checkout) {
    return { error: "Não foi possível iniciar o pagamento. Tente novamente." };
  }

  const origin = await getSiteOrigin();
  const periodLabel = plan.billing_interval === "yearly" ? "1 ano" : "1 mês";

  let preference;
  try {
    preference = await createPaymentPreference({
      title: `Plano ${plan.name} (${periodLabel}) — CHURCH-LAB`,
      quantity: 1,
      unitPrice: plan.price,
      externalReference: checkout.id,
      backUrls: {
        success: `${origin}/planos?checkout=sucesso`,
        pending: `${origin}/planos?checkout=pendente`,
        failure: `${origin}/planos?checkout=falhou`,
      },
      notificationUrl: `${origin}/api/webhooks/mercadopago`,
      payerEmail: user.email,
      // Só Pix aqui — cartão já tem o fluxo de assinatura de verdade (que
      // auto-renova); misturar os dois nessa tela confundiria qual é qual.
      excludedPaymentTypes: ["credit_card", "debit_card", "ticket"],
    });
  } catch (error) {
    console.error("Falha ao criar cobrança Pix no Mercado Pago:", error);
    return { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." };
  }

  await supabase.from("subscription_checkouts").update({ mp_preference_id: preference.id }).eq("id", checkout.id);

  redirect(preference.init_point);
}

export interface StartCreditCheckoutParams {
  packageId?: string;
  customAmount?: number;
}

/**
 * Cria uma cobrança avulsa pendente (Preference / Checkout Pro) no Mercado
 * Pago pelos créditos extras escolhidos (pacote pronto ou quantidade
 * personalizada) e redireciona pro checkout. Os créditos só são liberados
 * quando o webhook confirma o pagamento aprovado — ver
 * lib/mercadopago-handlers.ts. Exige assinatura ativa: créditos extras
 * somam no ciclo vigente, então sem ciclo não tem onde entrar.
 */
export async function startCreditCheckout(params: StartCreditCheckoutParams): Promise<CheckoutResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado pra comprar créditos." };

  const { data: activeSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!activeSub) {
    return { error: "Você precisa ter um plano ativo pra comprar créditos extras. Assine um plano primeiro." };
  }

  let creditsAmount: number;
  let price: number;
  let packageId: string | null = null;

  if (params.packageId) {
    const { data: pkg } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("id", params.packageId)
      .eq("is_active", true)
      .maybeSingle();
    if (!pkg) return { error: "Pacote não encontrado." };
    creditsAmount = pkg.credits_amount;
    price = pkg.price;
    packageId = pkg.id;
  } else if (params.customAmount !== undefined) {
    if (
      !Number.isInteger(params.customAmount) ||
      params.customAmount < CUSTOM_CREDIT_MIN ||
      params.customAmount > CUSTOM_CREDIT_MAX
    ) {
      return { error: `Quantidade inválida — escolha entre ${CUSTOM_CREDIT_MIN} e ${CUSTOM_CREDIT_MAX} créditos.` };
    }
    const settings = await getSiteSettings(supabase);
    creditsAmount = params.customAmount;
    price = Number((creditsAmount * settings.creditUnitPrice).toFixed(2));
  } else {
    return { error: "Escolha um pacote ou uma quantidade de créditos." };
  }

  if (price <= 0) {
    return { error: "Não foi possível calcular o valor da compra. Fale com o suporte." };
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from("credit_purchases")
    .insert({ user_id: user.id, credit_package_id: packageId, credits_amount: creditsAmount, amount: price, status: "pending" })
    .select("id")
    .single();

  if (purchaseError || !purchase) {
    return { error: "Não foi possível iniciar a compra. Tente novamente." };
  }

  const origin = await getSiteOrigin();

  let preference;
  try {
    preference = await createPaymentPreference({
      title: `${creditsAmount} créditos extras — CHURCH-LAB`,
      quantity: 1,
      unitPrice: price,
      externalReference: purchase.id,
      backUrls: {
        success: `${origin}/meus-creditos?compra=sucesso`,
        pending: `${origin}/meus-creditos?compra=pendente`,
        failure: `${origin}/meus-creditos?compra=falhou`,
      },
      notificationUrl: `${origin}/api/webhooks/mercadopago`,
      payerEmail: user.email,
    });
  } catch (error) {
    console.error("Falha ao criar preferência de pagamento no Mercado Pago:", error);
    return { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." };
  }

  await supabase.from("credit_purchases").update({ mp_preference_id: preference.id }).eq("id", purchase.id);

  redirect(preference.init_point);
}
