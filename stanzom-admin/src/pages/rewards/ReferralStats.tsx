import { useQuery } from '@tanstack/react-query';
import { Users, Download, TrendingUp, Coins } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { rewardService } from '@/services/rewardService';
import type { Referral } from '@/types';

export default function ReferralStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => rewardService.getReferralStats(),
  });

  const stats = data?.data;
  const referrals = stats?.referrals ?? [];

  const statCards = [
    { label: 'Total Referrals', value: stats?.totalReferrals ?? 0, icon: Users, color: 'text-blue' },
    { label: 'Successful Downloads', value: stats?.successfulDownloads ?? 0, icon: Download, color: 'text-green' },
    { label: 'Conversion Rate', value: (stats?.conversionRate ?? 0).toFixed(1) + '%', icon: TrendingUp, color: 'text-gold' },
    { label: 'Points Awarded', value: stats?.pointsAwarded ?? 0, icon: Coins, color: 'text-purple' },
  ];

  const columns: Column<Referral>[] = [
    { key: 'referrer', header: 'Referrer Name', render: (r) => r.referrer?.name ?? r.referrerId },
    { key: 'referralCode', header: 'Referral Code', render: (r) => r.referrer?.referralCode ?? '—' },
    { key: 'referee', header: 'Referred User', render: (r) => r.referee?.name ?? r.refereeId },
    { key: 'createdAt', header: 'Download Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: 'pointsAwarded', header: 'Points Awarded', render: (r) => (
      <span className="font-semibold text-green">+{r.pointsAwarded}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Referral Analytics</h1>
        <p className="mt-1 text-sm text-muted">Track referral performance and conversions</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card">
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-sm text-muted">{card.label}</p>
                <p className="text-2xl font-bold text-text">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={referrals as unknown as Record<string, unknown>[]}
        isLoading={isLoading} error={error ? 'Failed to load referral stats' : null}
        emptyMessage="No referral data found" />
    </div>
  );
}
