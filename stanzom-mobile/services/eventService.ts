import api from './api';

export interface EventParams {
  status?: string;
  sportSlug?: string;
  tournament?: string;
}

export interface BuzzPostData {
  content: string;
  postType: string;
  eventMoment?: string;
}

export interface RatingData {
  rating: number;
  reviewText?: string;
}

export const getEvents = (params: EventParams) =>
  api.get('/api/events', { params }).then(res => res.data.data);

export const getEventById = (id: string) =>
  api.get(`/api/events/${id}`).then(res => res.data.data);

export const addReaction = (eventId: string, emoji: string) =>
  api.post(`/api/events/${eventId}/reactions`, { emoji }).then(res => res.data);

export const getReactionsSummary = (eventId: string) =>
  api.get(`/api/events/${eventId}/reactions/summary`).then(res => res.data.data);

export const addBuzzPost = (eventId: string, data: BuzzPostData) =>
  api.post(`/api/events/${eventId}/buzz`, data).then(res => res.data);

export const getBuzzPosts = (eventId: string, type?: string, page?: number) =>
  api.get(`/api/events/${eventId}/buzz`, { params: { type, page } }).then(res => res.data.data);

export const getMoments = (eventId: string) =>
  api.get(`/api/events/${eventId}/moments`).then(res => res.data.data);

export const rateEvent = (eventId: string, data: RatingData) =>
  api.post(`/api/events/${eventId}/rating`, data).then(res => res.data);

export const getEventRating = (eventId: string) =>
  api.get(`/api/events/${eventId}/rating`).then(res => res.data.data);
