export interface PinterestImage {
  title: string;
  link: string;
  imageUrl: string;
}

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
    const rssUrl = toRssUrl(boardUrl);
    const response = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CHURCH-LAB/1.0)" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];

    const xml = await response.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

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
