import api from './api';

export interface PlayerParams {
  sportSlug?: string;
  teamId?: string;
  search?: string;
  page?: number;
}

export interface RatePlayerData {
  rating: number;
  comment?: string;
}

export const getPlayers = (params: PlayerParams) =>
  api.get('/api/players', { params }).then(res => res.data.data);

export const getPlayerById = (id: string) =>
  api.get(`/api/players/${id}`).then(res => res.data.data);

export const followPlayer = (id: string) =>
  api.post(`/api/players/${id}/follow`).then(res => res.data);

export const unfollowPlayer = (id: string) =>
  api.delete(`/api/players/${id}/follow`).then(res => res.data);

export const likePlayer = (id: string) =>
  api.post(`/api/players/${id}/like`).then(res => res.data);

export const ratePlayer = (id: string, data: RatePlayerData) =>
  api.post(`/api/players/${id}/rating`, data).then(res => res.data);
