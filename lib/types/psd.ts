export type CardShape = "square" | "vertical" | "horizontal";

/** Formato do card no nível do PSD (não da categoria) — ex. "cards de telão" (horizontais) misturados numa categoria de outro formato. `null` = usa o formato da categoria. */
export type CardOrientation = "vertical" | "horizontal";

export const CARD_SHAPES: { value: CardShape; label: string }[] = [
  { value: "square", label: "Quadrado" },
  { value: "vertical", label: "Retangular vertical" },
  { value: "horizontal", label: "Retangular horizontal" },
];

/** Proporção (aspect-ratio) do card de PSD pra cada formato — usado na grade pública. */
export const CARD_SHAPE_ASPECT: Record<CardShape, string> = {
  square: "aspect-[4/5]",
  vertical: "aspect-[3/5]",
  horizontal: "aspect-[5/3]",
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  card_shape: CardShape;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  card_shape: CardShape;
}

export interface PsdFile {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  file_path: string | null;
  canva_url: string | null;
  youtube_url: string | null;
  slides_count: number | null;
  file_size: number | null;
  file_format: string | null;
  dimensions: string | null;
  credit_cost: number;
  is_published: boolean;
  is_featured: boolean;
  content_type: ContentType;
  card_orientation: CardOrientation | null;
  created_at: string;
  updated_at: string;
  categories: Category[];
  downloadsCount: number;
}

export interface HomeSection {
  id: string;
  title: string;
  sort_order: number;
  is_active: boolean;
}

export interface HomeSectionWithItems extends HomeSection {
  items: PsdFile[];
}

export type ContentType = "psd" | "elementos" | "plugins" | "ferramentas" | "sistemas";

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "psd", label: "PSD" },
  { value: "elementos", label: "Elementos" },
  { value: "plugins", label: "Plugins" },
  { value: "ferramentas", label: "Ferramentas" },
  { value: "sistemas", label: "Sistemas" },
];

/** Cor de identidade por tipo de conteúdo — molda/selo do card estilo "trading card", uma cor por tipo (como raridade). */
export const CONTENT_TYPE_COLOR: Record<
  ContentType,
  { border: string; badgeBg: string; badgeText: string; statText: string }
> = {
  psd: { border: "border-accent/70", badgeBg: "bg-accent", badgeText: "text-accent-foreground", statText: "text-accent" },
  elementos: { border: "border-cyan/70", badgeBg: "bg-cyan", badgeText: "text-cyan-foreground", statText: "text-cyan" },
  plugins: { border: "border-success/70", badgeBg: "bg-success", badgeText: "text-success-foreground", statText: "text-success" },
  ferramentas: { border: "border-warning/70", badgeBg: "bg-warning", badgeText: "text-warning-foreground", statText: "text-warning" },
  sistemas: { border: "border-danger/70", badgeBg: "bg-danger", badgeText: "text-danger-foreground", statText: "text-danger" },
};
