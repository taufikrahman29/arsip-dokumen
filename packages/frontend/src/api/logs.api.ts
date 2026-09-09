import apiClient from './client';
import type { ApiResponse, ActivityLog, PaginationMeta } from '../types';

export const logsApi = {
  getAll: (params?: Record<string, any>) =>
    apiClient.get<ApiResponse<ActivityLog[]> & { meta: PaginationMeta }>('/logs', { params }),
};
