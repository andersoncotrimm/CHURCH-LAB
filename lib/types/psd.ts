export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
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
  slides_count: number | null;
  file_size: number | null;
  file_format: string | null;
  dimensions: string | null;
  credit_cost: number;
  is_published: boolean;
  is_featured: boolean;
  content_type: ContentType;
  created_at: string;
  updated_at: string;
  categories: Category[];
  downloadsCount: number;
}

export type ContentType = "psd" | "elementos" | "plugins" | "ferramentas" | "sistemas";

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "psd", label: "PSD" },
  { value: "elementos", label: "Elementos" },
  { value: "plugins", label: "Plugins" },
  { value: "ferramentas", label: "Ferramentas" },
  { value: "sistemas", label: "Sistemas" },
];
