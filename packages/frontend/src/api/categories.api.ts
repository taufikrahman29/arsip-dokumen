import apiClient from './client';
import type { ApiResponse, Category } from '../types';

export const categoriesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Category[]>>('/categories'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),

  update: (id: string, data: { name?: string; description?: string }) =>
    apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/categories/${id}`),
};
