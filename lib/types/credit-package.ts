export interface CreditPackage {
  id: string;
  name: string;
  credits_amount: number;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreditPackageFormValues {
  name: string;
  credits_amount: number;
  price: number;
  sort_order: number;
  is_active: boolean;
}
