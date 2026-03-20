import type { Team, Player, ApiResponse, PaginatedResponse } from '@/types';
import api from './api';

export interface TeamParams {
  page?: number;
  size?: number;
  sportId?: string;
  tournamentId?: string;
  search?: string;
}

export interface CreateTeamPayload {
  name: string;
  shortName: string;
  fullName?: string;
  logo?: string;
  logoUrl?: string;
  sportId: string;
  tournamentId?: string;
  city?: string;
  homeGround?: string;
  primaryColor?: string;
  secondaryColor?: string;
  foundedYear?: number;
  titles?: number;
  country?: string;
}

export interface UpdateTeamPayload extends Partial<CreateTeamPayload> {
  isActive?: boolean;
}

export const teamService = {
  async getTeams(params?: TeamParams): Promise<PaginatedResponse<Team[]>> {
    const { data } = await api.get<PaginatedResponse<Team[]>>('/teams', { params });
    return data;
  },

  async getTeam(id: string): Promise<ApiResponse<Team>> {
    const { data } = await api.get<ApiResponse<Team>>(`/teams/${id}`);
    return data;
  },

  async createTeam(payload: CreateTeamPayload): Promise<ApiResponse<Team>> {
    const { data } = await api.post<ApiResponse<Team>>('/teams', payload);
    return data;
  },

  async updateTeam(id: string, payload: UpdateTeamPayload): Promise<ApiResponse<Team>> {
    const { data } = await api.put<ApiResponse<Team>>(`/teams/${id}`, payload);
    return data;
  },

  async getSquad(teamId: string): Promise<ApiResponse<Player[]>> {
    const { data } = await api.get<ApiResponse<Player[]>>(`/teams/${teamId}/squad`);
    return data;
  },
};
