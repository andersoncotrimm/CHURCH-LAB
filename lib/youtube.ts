/** Extrai o ID de um link do YouTube (watch, youtu.be, shorts ou embed) e devolve a URL de embed. */
export function getYoutubeEmbedUrl(url: string): string | null {
  const match = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/.exec(url);
  if (!match) return null;
  return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&mute=1&controls=1&rel=0`;
}
