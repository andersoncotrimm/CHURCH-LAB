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
