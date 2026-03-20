import type { ApiResponse, DashboardKPIs } from '@/types';
import api from './api';

interface DAUHistoryEntry {
  date: string;
  count: number;
}

interface InstallsHistoryEntry {
  date: string;
  count: number;
}

interface SharesBreakdown {
  platform: string;
  count: number;
  percentage: number;
}

interface SportEngagementEntry {
  sport: string;
  percent: number;
}

export const dashboardService = {
  async getKPIs(): Promise<ApiResponse<DashboardKPIs>> {
    const { data } = await api.get<ApiResponse<DashboardKPIs>>('/dashboard/kpis');
    return data;
  },

  async getDAUHistory(days: number): Promise<ApiResponse<DAUHistoryEntry[]>> {
    const { data } = await api.get<ApiResponse<DAUHistoryEntry[]>>('/dashboard/dau-history', {
      params: { days },
    });
    return data;
  },

  async getInstallsHistory(days: number): Promise<ApiResponse<InstallsHistoryEntry[]>> {
    const { data } = await api.get<ApiResponse<InstallsHistoryEntry[]>>('/dashboard/installs-history', {
      params: { days },
    });
    return data;
  },

  async getSharesBreakdown(): Promise<ApiResponse<SharesBreakdown[]>> {
    const { data } = await api.get<ApiResponse<SharesBreakdown[]>>('/dashboard/shares-breakdown');
    return data;
  },

  async getSportEngagement(): Promise<ApiResponse<SportEngagementEntry[]>> {
    const { data } = await api.get<ApiResponse<SportEngagementEntry[]>>('/dashboard/sport-engagement');
    return data;
  },
};
