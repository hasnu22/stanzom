import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserCircle, Target, Coins, Calendar, Trophy, Heart } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { userService } from '@/services/userService';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id!),
    enabled: !!id,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats', id],
    queryFn: () => userService.getUserStats(id!),
    enabled: !!id,
  });

  const user = userData?.data;
  const stats = statsData?.data;
  const isLoading = userLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-border" />
        <div className="h-40 animate-pulse rounded-lg bg-border" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-muted py-12">User not found</div>;
  }

  const statCards = [
    { label: 'Season Points', value: stats?.seasonPoints ?? 0, icon: Coins, color: 'text-green' },
    { label: 'Accuracy', value: (stats?.accuracy ?? 0).toFixed(1) + '%', icon: Target, color: 'text-gold' },
    { label: 'Active Days', value: stats?.activeDays ?? 0, icon: Calendar, color: 'text-blue' },
    { label: 'Favorite Team', value: stats?.favoriteTeam ?? 'N/A', icon: Heart, color: 'text-red' },
    { label: 'Favorite Sport', value: stats?.favoriteSport ?? 'N/A', icon: Trophy, color: 'text-purple' },
  ];

  const predictionColumns: Column<Record<string, unknown>>[] = [
    { key: 'question', header: 'Question' },
    { key: 'selectedOption', header: 'Selected' },
    { key: 'isCorrect', header: 'Result', render: (r) => r.isCorrect === true ? (
      <span className="text-green font-semibold">Correct</span>
    ) : r.isCorrect === false ? (
      <span className="text-red font-semibold">Wrong</span>
    ) : <span className="text-muted">Pending</span> },
    { key: 'pointsEarned', header: 'Points', render: (r) => (
      <span className="text-green font-semibold">+{r.pointsEarned as number}</span>
    )},
    { key: 'createdAt', header: 'Date', render: (r) => new Date(r.createdAt as string).toLocaleDateString() },
  ];

  const txColumns: Column<Record<string, unknown>>[] = [
    { key: 'type', header: 'Type', render: (r) => (
      <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-gold">{r.type as string}</span>
    )},
    { key: 'points', header: 'Points', render: (r) => {
      const pts = r.points as number;
      return <span className={pts >= 0 ? 'text-green font-semibold' : 'text-red font-semibold'}>{pts >= 0 ? '+' : ''}{pts}</span>;
    }},
    { key: 'description', header: 'Description' },
    { key: 'createdAt', header: 'Date', render: (r) => new Date(r.createdAt as string).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">User Detail</h1>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold/10">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <UserCircle size={32} className="text-gold" />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-text">{user.name}</h2>
            <p className="text-sm text-muted">{user.email}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted mt-2">
              {user.phone && <span>Phone: {user.phone}</span>}
              {user.city && <span>City: {user.city}</span>}
              {user.state && <span>State: {user.state}</span>}
              {user.country && <span>Country: {user.country}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <c.icon size={18} className={c.color + ' mb-2'} />
            <p className="text-xs text-muted">{c.label}</p>
            <p className="text-lg font-bold text-text">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
          </div>
        ))}
      </div>

      {stats && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-muted mb-2">Referral Info</h3>
          <p className="text-sm text-text">Code: <span className="font-mono text-gold">{stats.referralCode}</span></p>
          {stats.referredBy && <p className="text-sm text-text">Referred By: {stats.referredBy}</p>}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-text mb-3">Recent Predictions</h3>
        <DataTable columns={predictionColumns}
          data={(stats?.recentPredictions ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No predictions yet" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text mb-3">Recent Transactions</h3>
        <DataTable columns={txColumns}
          data={(stats?.recentTransactions ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No transactions yet" />
      </div>
    </div>
  );
}
