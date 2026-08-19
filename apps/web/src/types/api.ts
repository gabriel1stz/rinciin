// api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  code: number;
  message: string;
  errors?: any;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
