import api from './api';

export interface PunditPostParams {
  eventId?: string;
  sportSlug?: string;
  page?: number;
  sort?: string;
}

export interface CreatePunditPostData {
  eventId: string;
  content: string;
  prediction?: string;
  mediaUrl?: string;
}

export const getPunditPosts = (params: PunditPostParams) =>
  api.get('/api/pundit/posts', { params }).then(res => res.data.data);

export const createPost = (data: CreatePunditPostData) =>
  api.post('/api/pundit/posts', data).then(res => res.data);

export const likePost = (id: string) =>
  api.post(`/api/pundit/posts/${id}/like`).then(res => res.data);

export const sharePost = (id: string, platform: string) =>
  api.post(`/api/pundit/posts/${id}/share`, { platform }).then(res => res.data);
