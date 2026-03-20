import type { PredictionQuestion, ApiResponse, PaginatedResponse } from '@/types';
import api from './api';

export interface CreateQuestionPayload {
  eventId: string;
  question: string;
  options: { label: string; sortOrder: number }[];
  pointsReward: number;
  deadline: string;
}

export interface LeaderboardParams {
  page?: number;
  size?: number;
  sportId?: string;
  tournamentId?: string;
  period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  accuracy: number;
}

export const predictionService = {
  async getQuestions(eventId: string): Promise<ApiResponse<PredictionQuestion[]>> {
    const { data } = await api.get<ApiResponse<PredictionQuestion[]>>(`/events/${eventId}/predictions`);
    return data;
  },

  async createQuestion(payload: CreateQuestionPayload): Promise<ApiResponse<PredictionQuestion>> {
    const { data } = await api.post<ApiResponse<PredictionQuestion>>('/predictions', payload);
    return data;
  },

  async resolveQuestion(questionId: string, correctOptionId: string): Promise<ApiResponse<PredictionQuestion>> {
    const { data } = await api.put<ApiResponse<PredictionQuestion>>(`/predictions/${questionId}/resolve`, {
      correctOptionId,
    });
    return data;
  },

  async getLeaderboard(params?: LeaderboardParams): Promise<PaginatedResponse<LeaderboardEntry[]>> {
    const { data } = await api.get<PaginatedResponse<LeaderboardEntry[]>>('/predictions/leaderboard', { params });
    return data;
  },
};
