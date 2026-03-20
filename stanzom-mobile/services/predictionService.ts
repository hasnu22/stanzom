import api from './api';

export interface LeaderboardParams {
  scope: string;
  city?: string;
  state?: string;
  sportSlug?: string;
}

export const getQuestions = (eventId: string) =>
  api.get(`/api/events/${eventId}/predictions/questions`).then(res => res.data.data);

export const answerQuestion = (questionId: string, selectedOptionId: string) =>
  api.post(`/api/predictions/questions/${questionId}/answer`, { selectedOptionId }).then(res => res.data);

export const lockPrediction = (questionId: string) =>
  api.post(`/api/predictions/questions/${questionId}/lock`).then(res => res.data);

export const getPredictionCard = (eventId: string) =>
  api.get(`/api/events/${eventId}/predictions/card`).then(res => res.data.data);

export const getLeaderboard = (params: LeaderboardParams) =>
  api.get('/api/predictions/leaderboard', { params }).then(res => res.data.data);
