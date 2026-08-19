// category.ts
export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  budgetable?: boolean;
  keywords?: string[];
  userId?: string | null;
}
