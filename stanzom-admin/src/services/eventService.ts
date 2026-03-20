import type { Event, ApiResponse, PaginatedResponse } from '@/types';
import api from './api';

export interface EventParams {
  page?: number;
  size?: number;
  sportId?: string;
  tournamentId?: string;
  status?: Event['status'];
  search?: string;
}

export interface CreateEventPayload {
  title: string;
  sportId: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  startTime: string;
  endTime?: string;
  venue?: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  status?: Event['status'];
}

export interface UpdateScorePayload {
  homeScore: number;
  awayScore: number;
  status?: Event['status'];
}

export interface EventReaction {
  type: string;
  count: number;
}

export const eventService = {
  async getEvents(params?: EventParams): Promise<PaginatedResponse<Event[]>> {
    const { data } = await api.get<PaginatedResponse<Event[]>>('/events', { params });
    return data;
  },

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`);
    return data;
  },

  async createEvent(payload: CreateEventPayload): Promise<ApiResponse<Event>> {
    const { data } = await api.post<ApiResponse<Event>>('/events', payload);
    return data;
  },

  async updateEvent(id: string, payload: UpdateEventPayload): Promise<ApiResponse<Event>> {
    const { data } = await api.put<ApiResponse<Event>>(`/events/${id}`, payload);
    return data;
  },

  async updateScore(id: string, scoreData: UpdateScorePayload): Promise<ApiResponse<Event>> {
    const { data } = await api.put<ApiResponse<Event>>(`/events/${id}/score`, scoreData);
    return data;
  },

  async getEventReactions(id: string): Promise<ApiResponse<EventReaction[]>> {
    const { data } = await api.get<ApiResponse<EventReaction[]>>(`/events/${id}/reactions`);
    return data;
  },
};
