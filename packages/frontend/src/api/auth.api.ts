import apiClient from './client';
import type { ApiResponse, LoginResponse, User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken }),

  logout: () =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/logout'),

  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),
};
