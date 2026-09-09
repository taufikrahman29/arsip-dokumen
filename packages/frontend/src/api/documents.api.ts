import apiClient from './client';
import type { ApiResponse, Document, DocumentStats, PaginationMeta } from '../types';

export const documentsApi = {
  getPublic: (params?: Record<string, any>) =>
    apiClient.get<ApiResponse<Document[]> & { meta: PaginationMeta }>('/documents', { params }),

  getAdmin: (params?: Record<string, any>) =>
    apiClient.get<ApiResponse<Document[]> & { meta: PaginationMeta }>('/documents/admin/list', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Document>>(`/documents/${id}`),

  create: (formData: FormData) =>
    apiClient.post<ApiResponse<Document>>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    apiClient.put<ApiResponse<Document>>(`/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/documents/${id}`),

  getDownloadUrl: (id: string) => `/api/documents/${id}/download`,

  getStats: () =>
    apiClient.get<ApiResponse<DocumentStats>>('/documents/stats'),
};
