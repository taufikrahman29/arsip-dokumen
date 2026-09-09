import apiClient from './client';
import type { ApiResponse, AppSettings } from '../types';

export const settingsApi = {
  get: () =>
    apiClient.get<ApiResponse<AppSettings>>('/settings'),

  update: (formData: FormData) =>
    apiClient.put<ApiResponse<AppSettings>>('/settings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
