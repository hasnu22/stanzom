import type { ApiResponse, PaginatedResponse, User } from '@/types';
import api from './api';

export interface UserStats {
  seasonPoints: number;
  accuracy: number;
  activeDays: number;
  favoriteTeam?: string;
  favoriteSport?: string;
  referralCode: string;
  referredBy?: string;
  recentPredictions: {
    id: string;
    question: string;
    selectedOption: string;
    isCorrect?: boolean;
    pointsEarned: number;
    createdAt: string;
  }[];
  recentTransactions: {
    id: string;
    type: string;
    points: number;
    description: string;
    createdAt: string;
  }[];
}

export interface UserListEntry extends User {
  username?: string;
  accuracy?: number;
  activeDays?: number;
  isInfluencer?: boolean;
}

export const userService = {
  async getUsers(params?: Record<string, unknown>): Promise<PaginatedResponse<UserListEntry[]>> {
    const { data } = await api.get<PaginatedResponse<UserListEntry[]>>('/users', { params });
    return data;
  },

  async getUser(id: string): Promise<ApiResponse<User>> {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  },

  async getUserStats(id: string): Promise<ApiResponse<UserStats>> {
    const { data } = await api.get<ApiResponse<UserStats>>(`/users/${id}/stats`);
    return data;
  },
};
