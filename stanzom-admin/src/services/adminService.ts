import type { Admin, ApiResponse, PaginatedResponse } from '@/types';
import api from './api';

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: Admin['role'];
  permissions: string[];
}

export interface UpdateAdminPayload {
  name?: string;
  email?: string;
  role?: Admin['role'];
  permissions?: string[];
}

export const adminService = {
  /** List all admins. Only SUPER_ADMIN can access this. */
  async getAdmins(params?: Record<string, unknown>): Promise<PaginatedResponse<Admin[]>> {
    const { data } = await api.get<PaginatedResponse<Admin[]>>('/admins', { params });
    return data;
  },

  async getAdminById(id: string): Promise<ApiResponse<Admin>> {
    const { data } = await api.get<ApiResponse<Admin>>(`/admins/${id}`);
    return data;
  },

  /** Create a new admin. Only SUPER_ADMIN can perform this. */
  async createAdmin(payload: CreateAdminPayload): Promise<ApiResponse<Admin>> {
    const { data } = await api.post<ApiResponse<Admin>>('/admins', payload);
    return data;
  },

  /** Update an existing admin. Only SUPER_ADMIN can perform this. */
  async updateAdmin(id: string, payload: UpdateAdminPayload): Promise<ApiResponse<Admin>> {
    const { data } = await api.put<ApiResponse<Admin>>(`/admins/${id}`, payload);
    return data;
  },

  /** Delete an admin. Only SUPER_ADMIN can perform this. */
  async deleteAdmin(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete<ApiResponse<null>>(`/admins/${id}`);
    return data;
  },
};
