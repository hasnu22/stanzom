import api from './api';

export interface NotificationSettings {
  matchAlerts?: boolean;
  predictionReminders?: boolean;
  socialUpdates?: boolean;
  promotions?: boolean;
}

export const getNotifications = (page?: number) =>
  api.get('/api/notifications', { params: { page } }).then(res => res.data.data);

export const markAsRead = (id: string) =>
  api.patch(`/api/notifications/${id}/read`).then(res => res.data);

export const getSettings = () =>
  api.get('/api/notifications/settings').then(res => res.data.data);

export const updateSettings = (data: NotificationSettings) =>
  api.put('/api/notifications/settings', data).then(res => res.data);
