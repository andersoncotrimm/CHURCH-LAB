import { NextRequest, NextResponse } from "next/server";
import { verifyMercadoPagoSignature } from "@/lib/mercadopago-webhook";
import { handlePayment, handlePreapproval, handleAuthorizedPayment } from "@/lib/mercadopago-handlers";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

export const maxDuration = 30;

interface MpWebhookBody {
  type?: string;
  topic?: string;
  action?: string;
  data?: { id?: string };
}

/**
 * Recebe as notificações do Mercado Pago configuradas em Suas integrações >
 * [app] > Webhooks (eventos: "Planos e assinaturas" cobre preapproval +
 * authorized_payment; "Pagamentos (legacy)" manda o tipo como `topic` em
 * vez de `type`/`data.id`, formato mais antigo — por isso aceitamos as
 * duas formas, tanto no corpo quanto na query string). Verifica a
 * assinatura antes de processar qualquer coisa — sem isso, qualquer um
 * poderia chamar esta rota fingindo um pagamento aprovado.
 */
export async function POST(request: NextRequest) {
  return handleWebhookRequest(request);
}

// O formato "legacy" historicamente podia chegar como GET — aceitamos
// também, pelo mesmo caminho (só processa se tiver dataId + type válidos).
export async function GET(request: NextRequest) {
  return handleWebhookRequest(request);
}

async function handleWebhookRequest(request: NextRequest) {
  const rawBody = request.method === "POST" ? await request.text() : "";

  let body: MpWebhookBody = {};
  try {
    body = rawBody ? (JSON.parse(rawBody) as MpWebhookBody) : {};
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const url = new URL(request.url);
  const dataId =
    body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "";
  const type =
    body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";

  if (!dataId || !type) {
    // Notificação sem informação acionável (ex.: ping de teste) — nada a fazer.
    return NextResponse.json({ ok: true });
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret) {
    const valid = verifyMercadoPagoSignature(
      request.headers.get("x-signature"),
      request.headers.get("x-request-id"),
      dataId,
      secret
    );
    if (!valid) {
      console.error(`[mercadopago] Webhook com assinatura inválida (type=${type}, dataId=${dataId}).`);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[mercadopago] MERCADOPAGO_WEBHOOK_SECRET não configurado — pulando verificação de assinatura.");
  }

  const supabase = createServiceRoleClient();

  try {
    if (type === "payment") {
      await handlePayment(supabase, dataId);
    } else if (type === "subscription_preapproval") {
      await handlePreapproval(supabase, dataId);
    } else if (type === "subscription_authorized_payment") {
      await handleAuthorizedPayment(supabase, dataId);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[mercadopago] Falha ao processar webhook (type=${type}, dataId=${dataId}):`, error);
    // 500 faz o Mercado Pago tentar reenviar mais tarde — correto pra falha
    // transitória (rede, timeout); erros de dados já são tratados sem throw.
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
