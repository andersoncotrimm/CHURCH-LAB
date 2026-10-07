/** Converte uma cor hex (#rrggbb) para a tripla HSL usada nas CSS custom
 * properties do design system (formato "H S% L%", sem `hsl()`). */
export function hexToHslTriple(hex: string): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return "0 0% 4%";

  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return `0 0% ${Math.round(l * 100)}%`;

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      break;
    case g:
      h = ((b - r) / d + 2) * 60;
      break;
    default:
      h = ((r - g) / d + 4) * 60;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Desloca a luminosidade de uma tripla "H S% L%" em `deltaPoints`, sem sair de [0,100]. */
export function shiftLightness(hslTriple: string, deltaPoints: number): string {
  const [h, s, l] = hslTriple.split(" ");
  const lightness = Math.min(100, Math.max(0, parseInt(l, 10) + deltaPoints));
  return `${h} ${s} ${lightness}%`;
}

/** true se a luminosidade da tripla "H S% L%" for menor que 50%. */
export function isDarkTriple(hslTriple: string): boolean {
  return parseInt(hslTriple.split(" ")[2], 10) < 50;
}

/**
 * Desloca a luminosidade pra "longe" do fundo, não só pra cima — clareia
 * quando o fundo é escuro (tema atual) e escurece quando o fundo é claro,
 * pra superfície/borda continuarem visíveis como uma camada por cima do
 * fundo nos dois casos. `shiftLightness` sozinha só clareia, o que faz
 * sentido pra fundo escuro mas deixa tudo branco-sobre-branco se o admin
 * escolher um fundo claro.
 */
export function layerLightness(backgroundHslTriple: string, deltaPoints: number): string {
  return shiftLightness(backgroundHslTriple, isDarkTriple(backgroundHslTriple) ? deltaPoints : -deltaPoints);
}

/** "Preto" ou "branco" (como tripla HSL) — o que der mais contraste sobre a cor informada. */
export function contrastingForeground(hex: string): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return "0 0% 100%";

  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.55 ? "0 0% 6%" : "0 0% 100%";
}

export function isValidHex(value: string): boolean {
  return /^#[a-f\d]{6}$/i.test(value.trim());
}

/**
 * Escala 50-900 (fundos sutis de item ativo -> texto vibrante sobre fundo
 * escuro) derivada da cor de destaque escolhida em /admin/configuracoes —
 * mantém o matiz/saturação da cor base, variando só a luminosidade, nos
 * mesmos pontos da antiga escala vermelha fixa que ela substitui.
 */
const ACCENT_SCALE_LIGHTNESS: Record<string, number> = {
  "50": 10,
  "100": 14,
  "200": 20,
  "300": 28,
  "400": 38,
  "500": 44,
  "600": 47,
  "700": 58,
  "800": 72,
  "900": 88,
};

export function buildAccentScale(hslTriple: string): Record<string, string> {
  const [h, s] = hslTriple.split(" ");
  const scale: Record<string, string> = {};
  for (const [stop, lightness] of Object.entries(ACCENT_SCALE_LIGHTNESS)) {
    scale[stop] = `${h} ${s} ${lightness}%`;
  }
  return scale;
}
