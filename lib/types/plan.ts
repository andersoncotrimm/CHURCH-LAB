export interface Plan {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  billing_interval: "monthly" | "yearly";
  monthly_credits: number;
  benefits: string[];
  limits: Record<string, unknown>;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanFormValues {
  name: string;
  slug: string;
  description: string;
  price: number;
  billing_interval: "monthly" | "yearly";
  monthly_credits: number;
  benefits: string[];
  limits: Record<string, unknown>;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
}
