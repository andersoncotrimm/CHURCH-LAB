/** Nomes de ícones disponíveis para os filtros administráveis (/admin/filtros). */
export const FILTER_ICON_NAMES = [
  "Layers",
  "FileImage",
  "Palette",
  "Puzzle",
  "Plug",
  "Wrench",
  "Grid3x3",
  "Sparkles",
  "Star",
  "Tag",
] as const;

export type FilterIconName = (typeof FILTER_ICON_NAMES)[number];
