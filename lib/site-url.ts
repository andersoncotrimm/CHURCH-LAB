import { headers } from "next/headers";

/**
 * Origem absoluta do site (ex: https://church-lab.vercel.app) a partir dos
 * headers da requisição atual — usado pra montar back_urls/notification_url
 * mandados pro Mercado Pago, que precisa de URLs completas (não relativas).
 */
export async function getSiteOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "https";

  if (!host) throw new Error("Não foi possível determinar o domínio do site a partir da requisição.");

  return `${proto}://${host}`;
}
