import type { Admin, ApiResponse } from '@/types';
import api from './api';

interface LoginResponse {
  admin: Admin;
  token: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('stanzom_admin_token');
  },

  async getMe(): Promise<ApiResponse<Admin>> {
    const { data } = await api.get<ApiResponse<Admin>>('/auth/me');
    return data;
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const { data } = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return data;
  },
};
