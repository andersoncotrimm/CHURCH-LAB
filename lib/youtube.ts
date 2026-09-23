/** Extrai o ID de um link do YouTube (watch, youtu.be, shorts ou embed). */
export function getYoutubeVideoId(url: string): string | null {
  const match = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/.exec(url);
  return match?.[1] ?? null;
}
