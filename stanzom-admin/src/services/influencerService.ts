import type { Influencer, InfluencerApplication, ApiResponse, PaginatedResponse } from '@/types';
import api from './api';

export interface InfluencerParams {
  page?: number;
  size?: number;
  sportId?: string;
  niche?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface ApplicationParams {
  page?: number;
  size?: number;
  status?: InfluencerApplication['status'];
}

export const influencerService = {
  async getInfluencers(params?: InfluencerParams): Promise<PaginatedResponse<Influencer[]>> {
    const { data } = await api.get<PaginatedResponse<Influencer[]>>('/influencers', { params });
    return data;
  },

  async getApplications(params?: ApplicationParams): Promise<PaginatedResponse<InfluencerApplication[]>> {
    const { data } = await api.get<PaginatedResponse<InfluencerApplication[]>>('/influencers/applications', {
      params,
    });
    return data;
  },

  async approveApplication(id: string): Promise<ApiResponse<InfluencerApplication>> {
    const { data } = await api.put<ApiResponse<InfluencerApplication>>(`/influencers/applications/${id}/approve`);
    return data;
  },

  async rejectApplication(id: string, reason: string): Promise<ApiResponse<InfluencerApplication>> {
    const { data } = await api.put<ApiResponse<InfluencerApplication>>(`/influencers/applications/${id}/reject`, {
      reason,
    });
    return data;
  },

  async getFeaturedInfluencers(): Promise<ApiResponse<Influencer[]>> {
    const { data } = await api.get<ApiResponse<Influencer[]>>('/influencers/featured');
    return data;
  },

  async updateFeaturedOrder(ids: string[]): Promise<ApiResponse<null>> {
    const { data } = await api.put<ApiResponse<null>>('/influencers/featured-order', { ids });
    return data;
  },
};
