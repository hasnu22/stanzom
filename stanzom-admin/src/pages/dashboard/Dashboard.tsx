import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Download,
  Target,
  Award,
  Share2,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { dashboardService } from '@/services/dashboardService';

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                   */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-5 animate-pulse">
      <div className="h-4 w-24 rounded bg-(--color-border) mb-3" />
      <div className="h-8 w-20 rounded bg-(--color-border)" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-5 animate-pulse h-72" />
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, icon, accent = 'text-(--color-gold)' }: StatCardProps) {
  return (
    <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-(--color-bg) ${accent}`}>{icon}</div>
      <div>
        <p className="text-sm text-(--color-muted)">{label}</p>
        <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart colours                                                      */
/* ------------------------------------------------------------------ */

const PIE_COLORS = ['#F5A623', '#00E676', '#4A9EFF', '#A855F7', '#00D4FF', '#FF4757'];
const CHART_GOLD = '#F5A623';
const CHART_GREEN = '#00E676';

/* ------------------------------------------------------------------ */
/*  Custom Recharts tooltip                                            */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-(--color-sidebar) border border-(--color-border) px-3 py-2 text-xs">
      <p className="text-(--color-muted) mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboard,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Daily Active Users"
            value={data?.dau ?? 0}
            icon={<Users size={20} />}
          />
          <StatCard
            label="New Installs (Today)"
            value={data?.newInstallsToday ?? 0}
            icon={<Download size={20} />}
            accent="text-(--color-green)"
          />
          <StatCard
            label="Predictions Today"
            value={data?.predictionsToday ?? 0}
            icon={<Target size={20} />}
            accent="text-(--color-blue)"
          />
          <StatCard
            label="Points Issued Today"
            value={data?.pointsIssuedToday ?? 0}
            icon={<Award size={20} />}
            accent="text-(--color-purple)"
          />
        </div>
      )}

      {/* Charts Row 1 */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DAU Chart */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-5">
            <h2 className="text-lg font-semibold mb-4">DAU (7-day trend)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.dauTrend ?? []}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_GOLD} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#48566B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#48566B', fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="DAU"
                  stroke={CHART_GOLD}
                  fill="url(#dauGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Installs Chart */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-5">
            <h2 className="text-lg font-semibold mb-4">New Installs (7-day)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.installsTrend ?? []}>
                <defs>
                  <linearGradient id="installGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_GREEN} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#48566B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#48566B', fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Installs"
                  stroke={CHART_GREEN}
                  fill="url(#installGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row 2 */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shares Breakdown */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-5">
            <h2 className="text-lg font-semibold mb-4">Shares Breakdown</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data?.sharesBreakdown ?? []}
                  dataKey="value"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ channel, percent }) =>
                    `${channel} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {(data?.sharesBreakdown ?? []).map((_: any, idx: number) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Sport Engagement */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-5">
            <h2 className="text-lg font-semibold mb-4">Sport Engagement</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={data?.sportEngagement ?? []}
                layout="vertical"
                margin={{ left: 60 }}
              >
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: '#48566B', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="sport"
                  tick={{ fill: '#48566B', fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="predictions" name="Predictions" fill={CHART_GOLD} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Row: Top Cities + Referral */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonChart />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 10 Cities */}
          <div className="lg:col-span-2 rounded-xl bg-(--color-card) border border-(--color-border) p-5">
            <h2 className="text-lg font-semibold mb-4">Top 10 Cities</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-(--color-muted) border-b border-(--color-border)">
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-left py-2 px-3">City</th>
                  <th className="text-right py-2 px-3">Active Users</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topCities ?? []).map((city: any, idx: number) => (
                  <tr
                    key={city.name}
                    className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg)/50"
                  >
                    <td className="py-2 px-3 text-(--color-muted)">{idx + 1}</td>
                    <td className="py-2 px-3">{city.name}</td>
                    <td className="py-2 px-3 text-right font-medium">
                      {city.activeUsers.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Referral Conversion */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-5 flex flex-col items-center justify-center text-center gap-3">
            <div className="p-3 rounded-lg bg-(--color-bg) text-(--color-cyan)">
              <Share2 size={24} />
            </div>
            <p className="text-sm text-(--color-muted)">Referral Conversion Rate</p>
            <p className="text-4xl font-bold text-(--color-cyan)">
              {data?.referralConversionRate != null
                ? `${data.referralConversionRate}%`
                : '--'}
            </p>
            <div className="flex items-center gap-1 text-xs text-(--color-green)">
              <TrendingUp size={14} />
              <span>vs last week</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
