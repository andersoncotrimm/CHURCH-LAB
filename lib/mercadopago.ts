/**
 * Chamadas à API REST do Mercado Pago, direto via fetch (sem SDK) — o
 * token de acesso (MERCADOPAGO_ACCESS_TOKEN) é o mesmo pra sandbox/teste
 * ou produção, dependendo de qual foi configurado; a própria API do
 * Mercado Pago decide o ambiente a partir do prefixo do token.
 */

const MP_API_BASE = "https://api.mercadopago.com";

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
  return token;
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${MP_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mercado Pago (${path}) retornou ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Checkout Pro (cobrança única) — usado pra créditos extras avulsos.
// ---------------------------------------------------------------------------

export interface MpPreferenceParams {
  title: string;
  quantity: number;
  unitPrice: number;
  externalReference: string;
  backUrls: { success: string; pending: string; failure: string };
  notificationUrl: string;
  payerEmail?: string;
}

export interface MpPreferenceResult {
  id: string;
  init_point: string;
}

export async function createPaymentPreference(params: MpPreferenceParams): Promise<MpPreferenceResult> {
  return mpFetch<MpPreferenceResult>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [
        {
          title: params.title,
          quantity: params.quantity,
          unit_price: params.unitPrice,
          currency_id: "BRL",
        },
      ],
      external_reference: params.externalReference,
      back_urls: params.backUrls,
      auto_return: "approved",
      notification_url: params.notificationUrl,
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
    }),
  });
}

export interface MpPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
}

export async function getPayment(paymentId: string): Promise<MpPayment> {
  return mpFetch<MpPayment>(`/v1/payments/${paymentId}`);
}

// ---------------------------------------------------------------------------
// Preapproval (assinatura recorrente) — usado pelos planos.
// ---------------------------------------------------------------------------

export interface MpPreapprovalParams {
  reason: string;
  externalReference: string;
  payerEmail: string;
  backUrl: string;
  /** 1 = mensal, 12 = anual (cobrado a cada 12 meses) — Mercado Pago só aceita frequency_type "months" ou "days". */
  frequency: number;
  transactionAmount: number;
}

export interface MpPreapprovalResult {
  id: string;
  init_point: string;
  status: string;
}

export async function createPreapproval(params: MpPreapprovalParams): Promise<MpPreapprovalResult> {
  return mpFetch<MpPreapprovalResult>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: params.reason,
      external_reference: params.externalReference,
      payer_email: params.payerEmail,
      back_url: params.backUrl,
      auto_recurring: {
        frequency: params.frequency,
        frequency_type: "months",
        transaction_amount: params.transactionAmount,
        currency_id: "BRL",
      },
      status: "pending",
    }),
  });
}

export interface MpPreapproval {
  id: string;
  status: string;
  external_reference: string | null;
}

export async function getPreapproval(preapprovalId: string): Promise<MpPreapproval> {
  return mpFetch<MpPreapproval>(`/preapproval/${preapprovalId}`);
}

export interface MpAuthorizedPayment {
  id: number;
  preapproval_id: string;
  status: string;
  transaction_amount: number;
}

export async function getAuthorizedPayment(authorizedPaymentId: string): Promise<MpAuthorizedPayment> {
  return mpFetch<MpAuthorizedPayment>(`/authorized_payments/${authorizedPaymentId}`);
}
