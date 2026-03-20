import type { PunditPost, ApiResponse, PaginatedResponse } from '@/types';
import api from './api';

export interface PunditPostParams {
  page?: number;
  size?: number;
  sportId?: string;
  eventId?: string;
  audienceType?: string;
  isFeatured?: boolean;
  isHidden?: boolean;
  search?: string;
}

export const punditService = {
  async getPosts(params?: PunditPostParams): Promise<PaginatedResponse<PunditPost[]>> {
    const { data } = await api.get<PaginatedResponse<PunditPost[]>>('/pundit-posts', { params });
    return data;
  },

  async featurePost(id: string): Promise<ApiResponse<PunditPost>> {
    const { data } = await api.put<ApiResponse<PunditPost>>(`/pundit-posts/${id}/feature`);
    return data;
  },

  async hidePost(id: string): Promise<ApiResponse<PunditPost>> {
    const { data } = await api.put<ApiResponse<PunditPost>>(`/pundit-posts/${id}/hide`);
    return data;
  },
};
