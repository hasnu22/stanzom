import type { ApiResponse, PaginatedResponse, Notification } from '@/types';
import api from './api';

export type NotificationTargetType =
  | 'ALL_USERS'
  | 'CITY'
  | 'STATE'
  | 'TEAM_FOLLOWERS'
  | 'PLAYER_FOLLOWERS'
  | 'SPORT_FOLLOWERS';

export interface SendNotificationPayload {
  targetType: NotificationTargetType;
  targetId?: string;
  title: string;
  body: string;
  template?: string;
}

export interface NotificationHistoryEntry {
  id: string;
  title: string;
  target: string;
  sentAt: string;
  recipientCount: number;
}

export const notificationService = {
  async send(payload: SendNotificationPayload): Promise<ApiResponse<Notification>> {
    const { data } = await api.post<ApiResponse<Notification>>('/notifications/send', payload);
    return data;
  },

  async getHistory(params?: Record<string, unknown>): Promise<PaginatedResponse<NotificationHistoryEntry[]>> {
    const { data } = await api.get<PaginatedResponse<NotificationHistoryEntry[]>>('/notifications/history', { params });
    return data;
  },
};
