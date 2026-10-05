import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifica a assinatura do webhook do Mercado Pago (doc oficial: "Validar
 * origem da notificação"). O manifesto assinado é
 * `id:{dataId};request-id:{xRequestId};ts:{ts};`, em HMAC-SHA256 com a
 * chave secreta configurada em Suas integrações > [app] > Webhooks no
 * painel do Mercado Pago (MERCADOPAGO_WEBHOOK_SECRET). Sem isso, qualquer
 * um poderia chamar o endpoint fingindo que um pagamento foi aprovado.
 */
export function verifyMercadoPagoSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!xSignature || !xRequestId || !dataId) return false;

  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, value] = part.split("=").map((s) => s.trim());
    if (key && value) parts[key] = value;
  }

  const ts = parts.ts;
  const receivedHash = parts.v1;
  if (!ts || !receivedHash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest("hex");

  const expected = Buffer.from(expectedHash, "utf8");
  const received = Buffer.from(receivedHash, "utf8");
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}
