// category.service.ts
import api from './api';
import { ApiResponse } from '../types/api';
import { Category } from '../types/category';

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },
};
