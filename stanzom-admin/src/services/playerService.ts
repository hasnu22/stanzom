import type { Player, ApiResponse, PaginatedResponse } from '@/types';
import api from './api';

export interface PlayerParams {
  page?: number;
  size?: number;
  teamId?: string;
  sportId?: string;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface CreatePlayerPayload {
  name: string;
  photo?: string;
  teamId?: string;
  sportId: string;
  role?: string;
  position?: string;
  nationality?: string;
  jerseyNumber?: number;
  bio?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdatePlayerPayload extends Partial<CreatePlayerPayload> {
  isActive?: boolean;
}

export const playerService = {
  async getPlayers(params?: PlayerParams): Promise<PaginatedResponse<Player[]>> {
    const { data } = await api.get<PaginatedResponse<Player[]>>('/players', { params });
    return data;
  },

  async getPlayer(id: string): Promise<ApiResponse<Player>> {
    const { data } = await api.get<ApiResponse<Player>>(`/players/${id}`);
    return data;
  },

  async createPlayer(payload: CreatePlayerPayload): Promise<ApiResponse<Player>> {
    const { data } = await api.post<ApiResponse<Player>>('/players', payload);
    return data;
  },

  async updatePlayer(id: string, payload: UpdatePlayerPayload): Promise<ApiResponse<Player>> {
    const { data } = await api.put<ApiResponse<Player>>(`/players/${id}`, payload);
    return data;
  },
};
