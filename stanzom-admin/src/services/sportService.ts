import type { Sport, Tournament, ApiResponse, PaginatedResponse } from '@/types';
import api from './api';

export interface CreateSportPayload {
  name: string;
  slug: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateSportPayload extends Partial<CreateSportPayload> {
  isActive?: boolean;
}

export interface TournamentParams {
  page?: number;
  size?: number;
  sportId?: string;
  search?: string;
  isActive?: boolean;
}

export interface CreateTournamentPayload {
  name: string;
  slug: string;
  sportId: string;
  logo?: string;
  startDate: string;
  endDate: string;
}

export const sportService = {
  async getSports(): Promise<ApiResponse<Sport[]>> {
    const { data } = await api.get<ApiResponse<Sport[]>>('/sports');
    return data;
  },

  async getSport(slug: string): Promise<ApiResponse<Sport>> {
    const { data } = await api.get<ApiResponse<Sport>>(`/sports/${slug}`);
    return data;
  },

  async createSport(payload: CreateSportPayload): Promise<ApiResponse<Sport>> {
    const { data } = await api.post<ApiResponse<Sport>>('/sports', payload);
    return data;
  },

  async updateSport(id: string, payload: UpdateSportPayload): Promise<ApiResponse<Sport>> {
    const { data } = await api.put<ApiResponse<Sport>>(`/sports/${id}`, payload);
    return data;
  },

  async getTournaments(params?: TournamentParams): Promise<PaginatedResponse<Tournament[]>> {
    const { data } = await api.get<PaginatedResponse<Tournament[]>>('/tournaments', { params });
    return data;
  },

  async createTournament(payload: CreateTournamentPayload): Promise<ApiResponse<Tournament>> {
    const { data } = await api.post<ApiResponse<Tournament>>('/tournaments', payload);
    return data;
  },
};
