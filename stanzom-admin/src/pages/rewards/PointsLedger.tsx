import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Coins, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { rewardService } from '@/services/rewardService';
import type { RewardTransaction } from '@/types';

const TX_TYPES = ['ALL', 'PREDICTION', 'SHARE', 'REFERRAL', 'DAILY_LOGIN', 'VOTE', 'RATE'] as const;

export default function PointsLedger() {
  const [txType, setTxType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const params: Record<string, unknown> = { page, size: 20 };
  if (txType !== 'ALL') params.type = txType;
  if (search) params.search = search;

  const { data, isLoading, error } = useQuery({
    queryKey: ['points-ledger', params],
    queryFn: () => rewardService.getPointsLedger(params),
  });

  const transactions = data?.data?.transactions ?? [];
  const summary = data?.data?.summary;

  const columns: Column<RewardTransaction>[] = [
    { key: 'user', header: 'User', render: (r) => r.user?.name ?? r.userId },
    { key: 'points', header: 'Points', render: (r) => (
      <span className={r.points >= 0 ? 'text-green font-semibold' : 'text-red font-semibold'}>
        {r.points >= 0 ? '+' : ''}{r.points}
      </span>
    )},
    { key: 'type', header: 'Transaction Type', render: (r) => (
      <span className="inline-flex rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-gold">{r.type}</span>
    )},
    { key: 'description', header: 'Description', render: (r) => r.description },
    { key: 'referenceId', header: 'Reference', render: (r) => r.referenceId ?? '—' },
    { key: 'createdAt', header: 'Date', render: (r) => new Date(r.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Points Ledger</h1>
        <p className="mt-1 text-sm text-muted">Points transaction history across all users</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green/10">
                <Coins size={20} className="text-green" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Points Issued Today</p>
                <p className="text-2xl font-bold text-text">{summary.totalPointsIssuedToday.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                <TrendingUp size={20} className="text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted">Avg Points Per User</p>
                <p className="text-2xl font-bold text-text">{summary.avgPointsPerUser.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label>Transaction Type</Label>
          <Select value={txType} onValueChange={(v) => { setTxType(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TX_TYPES.map((t) => (<SelectItem key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Search User</Label>
          <Input placeholder="Search by name..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-56" />
        </div>
      </div>

      <DataTable columns={columns} data={transactions as unknown as Record<string, unknown>[]}
        isLoading={isLoading} error={error ? 'Failed to load transactions' : null}
        page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage}
        emptyMessage="No transactions found" />
    </div>
  );
}
