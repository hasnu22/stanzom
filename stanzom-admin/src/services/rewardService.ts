import type { ApiResponse, PaginatedResponse, RewardTransaction, Referral } from '@/types';
import api from './api';

export interface PointsLedgerSummary {
  totalPointsIssuedToday: number;
  avgPointsPerUser: number;
}

export interface PointsLedgerResponse {
  transactions: RewardTransaction[];
  summary: PointsLedgerSummary;
}

export interface ReferralStatsResponse {
  totalReferrals: number;
  successfulDownloads: number;
  conversionRate: number;
  pointsAwarded: number;
  referrals: Referral[];
}

export const rewardService = {
  async getPointsLedger(params?: Record<string, unknown>): Promise<PaginatedResponse<PointsLedgerResponse>> {
    const { data } = await api.get<PaginatedResponse<PointsLedgerResponse>>('/rewards/points-ledger', { params });
    return data;
  },

  async getReferralStats(params?: Record<string, unknown>): Promise<ApiResponse<ReferralStatsResponse>> {
    const { data } = await api.get<ApiResponse<ReferralStatsResponse>>('/rewards/referral-stats', { params });
    return data;
  },
};
