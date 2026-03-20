import api from './api';

export const getMyRewards = () =>
  api.get('/api/rewards/my').then(res => res.data.data);

export const getReferralInfo = () =>
  api.get('/api/rewards/referral').then(res => res.data.data);

export const logShare = (platform: string, contentType: string, contentId: string) =>
  api.post('/api/rewards/share', { platform, contentType, contentId }).then(res => res.data);
