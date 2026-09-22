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
  file_path: string;
  file_size: number | null;
  file_format: string | null;
  dimensions: string | null;
  credit_cost: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  categories: Category[];
  downloadsCount: number;
}
