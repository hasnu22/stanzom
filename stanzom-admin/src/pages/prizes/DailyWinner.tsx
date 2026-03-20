import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { prizeService, type LeaderboardEntry } from '@/services/prizeService';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const SPORTS = [
  { id: 'all', name: 'All Sports' },
  { id: 'cricket', name: 'Cricket' },
  { id: 'football', name: 'Football' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'kabaddi', name: 'Kabaddi' },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function DailyWinner() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [sportFilter, setSportFilter] = useState('all');
  const { admin } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['daily-winner', selectedDate, sportFilter],
    queryFn: () =>
      prizeService.getDailyWinner(
        selectedDate,
        sportFilter !== 'all' ? sportFilter : undefined,
      ),
  });

  const triggerPrizeMutation = useMutation({
    mutationFn: () => prizeService.triggerPrize(selectedDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-winner'] });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: ({ userId, prizeId }: { userId: string; prizeId: string }) =>
      prizeService.sendReminder(userId, prizeId),
  });

  const leaderboard = data?.data?.leaderboard ?? [];
  const prize = data?.data?.prize;

  const columns: Column<LeaderboardEntry>[] = [
    {
      key: 'rank',
      header: 'Rank',
      render: (row) => (
        <span className={cn('font-bold', row.isWinner && 'text-gold')}>
          #{row.rank}
        </span>
      ),
    },
    { key: 'userName', header: 'User Name' },
    { key: 'city', header: 'City' },
    {
      key: 'pointsScored',
      header: 'Points Scored',
      render: (row) => (
        <span className="font-semibold text-green">{row.pointsScored}</span>
      ),
    },
    {
      key: 'predictionAccuracy',
      header: 'Accuracy %',
      render: (row) => `${row.predictionAccuracy.toFixed(1)}%`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.isWinner ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold">
            <Trophy size={12} /> Winner
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
  ];

  const statusColor: Record<string, string> = {
    PENDING: 'bg-gold/10 text-gold',
    DISPATCHED: 'bg-blue/10 text-blue',
    DELIVERED: 'bg-green/10 text-green',
    DRAWN: 'bg-purple/10 text-purple',
    CLAIMED: 'bg-cyan/10 text-cyan',
    EXPIRED: 'bg-red/10 text-red',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Daily Prize Management</h1>
        <p className="mt-1 text-sm text-muted">
          View daily leaderboard and manage prize distribution
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sport</Label>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(admin?.role === 'SUPER_ADMIN' || admin?.role === 'ADMIN') && (
          <Button
            onClick={() => triggerPrizeMutation.mutate()}
            disabled={triggerPrizeMutation.isPending}
          >
            {triggerPrizeMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trophy size={16} />
            )}
            Trigger Prize
          </Button>
        )}
      </div>

      {/* Prize Details Card */}
      {prize && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">
                {prize.prizeName}
              </h3>
              <p className="text-sm text-muted">
                {prize.prizeValue ? `Value: Rs. ${prize.prizeValue}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                  statusColor[prize.status] ?? 'bg-border text-muted',
                )}
              >
                {prize.status}
              </span>
              {prize.winnerId && prize.status === 'DRAWN' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    sendReminderMutation.mutate({
                      userId: prize.winnerId!,
                      prizeId: prize.id,
                    })
                  }
                  disabled={sendReminderMutation.isPending}
                >
                  {sendReminderMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Send Reminder
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <DataTable
        columns={columns}
        data={leaderboard}
        isLoading={isLoading}
        error={error ? 'Failed to load leaderboard' : null}
        rowClassName={(row) =>
          row.isWinner
            ? 'bg-gold/5 border-l-2 border-l-gold'
            : ''
        }
        emptyMessage="No leaderboard data for this date"
      />
    </div>
  );
}
