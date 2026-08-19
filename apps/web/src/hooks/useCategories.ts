// useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';

export const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories() {
  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  return {
    ...query,
    categories: query.data || [],
  };
}
