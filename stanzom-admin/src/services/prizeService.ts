import type { ApiResponse, PaginatedResponse, DailyPrize, PrizeDeliveryAddress } from '@/types';
import api from './api';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  city: string;
  pointsScored: number;
  predictionAccuracy: number;
  isWinner: boolean;
}

export interface DailyWinnerResponse {
  date: string;
  sportId?: string;
  leaderboard: LeaderboardEntry[];
  prize?: DailyPrize;
}

export const prizeService = {
  async getDailyWinner(date: string, sportId?: string): Promise<ApiResponse<DailyWinnerResponse>> {
    const { data } = await api.get<ApiResponse<DailyWinnerResponse>>('/prizes/daily-winner', {
      params: { date, sportId },
    });
    return data;
  },

  async triggerPrize(date: string): Promise<ApiResponse<DailyPrize>> {
    const { data } = await api.post<ApiResponse<DailyPrize>>('/prizes/trigger', { date });
    return data;
  },

  async sendReminder(userId: string, prizeId: string): Promise<ApiResponse<null>> {
    const { data } = await api.post<ApiResponse<null>>('/prizes/send-reminder', { userId, prizeId });
    return data;
  },

  async getAddresses(params?: Record<string, unknown>): Promise<PaginatedResponse<PrizeDeliveryAddress[]>> {
    const { data } = await api.get<PaginatedResponse<PrizeDeliveryAddress[]>>('/prizes/addresses', { params });
    return data;
  },

  async updateAddress(id: string, payload: Partial<PrizeDeliveryAddress>): Promise<ApiResponse<PrizeDeliveryAddress>> {
    const { data } = await api.put<ApiResponse<PrizeDeliveryAddress>>(`/prizes/addresses/${id}`, payload);
    return data;
  },

  async exportAddressesCsv(params?: Record<string, unknown>): Promise<Blob> {
    const { data } = await api.get('/prizes/addresses/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },
};
