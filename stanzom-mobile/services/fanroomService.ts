import api from './api';

export interface CreateRoomData {
  name: string;
  eventId?: string;
  sportSlug?: string;
  isPrivate?: boolean;
}

export interface SendMessageData {
  content: string;
  messageType?: string;
  replyToId?: string;
}

export interface InviteContactData {
  phoneNumber: string;
  name?: string;
}

export const createRoom = (data: CreateRoomData) =>
  api.post('/api/fanrooms', data).then(res => res.data.data);

export const getMyRooms = () =>
  api.get('/api/fanrooms/my').then(res => res.data.data);

export const getRoomById = (id: string) =>
  api.get(`/api/fanrooms/${id}`).then(res => res.data.data);

export const sendMessage = (roomId: string, data: SendMessageData) =>
  api.post(`/api/fanrooms/${roomId}/messages`, data).then(res => res.data);

export const getMessages = (roomId: string, page?: number) =>
  api.get(`/api/fanrooms/${roomId}/messages`, { params: { page } }).then(res => res.data.data);

export const inviteContact = (roomId: string, data: InviteContactData) =>
  api.post(`/api/fanrooms/${roomId}/invite`, data).then(res => res.data);

export const acceptInvite = (roomId: string) =>
  api.post(`/api/fanrooms/${roomId}/invite/accept`).then(res => res.data);

export const declineInvite = (roomId: string) =>
  api.post(`/api/fanrooms/${roomId}/invite/decline`).then(res => res.data);

export const joinByCode = (inviteCode: string) =>
  api.post(`/api/fanrooms/join/${inviteCode}`).then(res => res.data);

export const getMembers = (roomId: string) =>
  api.get(`/api/fanrooms/${roomId}/members`).then(res => res.data.data);

export const getContacts = (roomId: string) =>
  api.get(`/api/fanrooms/${roomId}/contacts`).then(res => res.data.data);
