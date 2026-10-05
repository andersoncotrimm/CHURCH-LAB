export interface PinterestImage {
  title: string;
  link: string;
  imageUrl: string;
}

// Cabeçalhos parecidos com os de um navegador real — o Pinterest costuma
// aplicar bloqueio/limite mais rígido em requisições vindas de servidores
// (datacenter) do que de navegadores de verdade, mesmo pra conteúdo
// público.
const BROWSER_LIKE_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml;q=0.9, text/html;q=0.8, */*;q=0.5",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://www.pinterest.com/",
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .trim();
}

/** Board do Pinterest -> URL do feed RSS público dele (sem precisar de login/API key). */
function toRssUrl(boardUrl: string): string {
  const trimmed = boardUrl.trim().split(/[?#]/)[0].replace(/\/+$/, "");
  return trimmed.endsWith(".rss") ? trimmed : `${trimmed}.rss`;
}

/**
 * Links encurtados (pin.it/...), do botão "Compartilhar" do app do
 * Pinterest, não têm feed RSS próprio — só o board real em pinterest.com
 * tem. Segue o redirecionamento pra achar a URL completa antes de montar
 * o link do RSS. Se falhar por qualquer motivo, devolve a URL original
 * (o fetch do RSS logo depois vai falhar igual e cair na lista vazia).
 */
async function resolveShortUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!/^https?:\/\/pin\.it\//i.test(trimmed)) return trimmed;

  try {
    const response = await fetch(trimmed, {
      redirect: "follow",
      headers: BROWSER_LIKE_HEADERS,
    });
    return response.url || trimmed;
  } catch {
    return trimmed;
  }
}

function extractImageUrl(itemXml: string): string | null {
  const media = /<media:content[^>]*url="([^"]+)"/i.exec(itemXml);
  if (media) return media[1];

  const enclosure = /<enclosure[^>]*url="([^"]+)"/i.exec(itemXml);
  if (enclosure) return enclosure[1];

  const img = /<img[^>]*src="([^"]+)"/i.exec(itemXml);
  if (img) return img[1];

  return null;
}

/**
 * Busca as imagens de um board público do Pinterest via feed RSS (recurso
 * público do próprio Pinterest, sem precisar de API key/OAuth). Degrada
 * para lista vazia em qualquer falha — a página que chama isso nunca
 * deve quebrar por causa de uma instabilidade externa.
 */
export async function getPinterestBoardImages(boardUrl: string, limit = 60): Promise<PinterestImage[]> {
  try {
    const resolvedUrl = await resolveShortUrl(boardUrl);
    const rssUrl = toRssUrl(resolvedUrl);
    const response = await fetch(rssUrl, {
      redirect: "follow",
      headers: BROWSER_LIKE_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      console.error(
        `Feed RSS do Pinterest (${rssUrl}) retornou ${response.status}. Confirme que o board é público (não secreto) e que o link está correto.`
      );
      return [];
    }

    const xml = await response.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

    if (items.length === 0) {
      console.error(
        `Feed RSS do Pinterest (${rssUrl}) respondeu OK mas sem nenhum <item> — board vazio, renomeado, ou o Pinterest devolveu uma página diferente do RSS esperado (ex: tela de login).`
      );
    }

    const images: PinterestImage[] = [];
    for (const itemXml of items) {
      const imageUrl = extractImageUrl(itemXml);
      if (!imageUrl) continue;

      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemXml);
      const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(itemXml);
      const rawTitle = titleMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") ?? "";

      images.push({
        title: decodeHtmlEntities(rawTitle) || "Referência",
        link: linkMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() ?? boardUrl,
        imageUrl,
      });

      if (images.length >= limit) break;
    }

    return images;
  } catch (error) {
    console.error("Falha ao buscar imagens do Pinterest:", error);
    return [];
  }
}
