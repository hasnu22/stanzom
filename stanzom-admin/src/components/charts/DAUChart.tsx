import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DAUChartProps {
  data: { date: string; users: number }[];
  period: '7d' | '30d';
}

export function DAUChart({ data, period }: DAUChartProps) {
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Daily Active Users</h3>
        <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
          {period === '7d' ? 'Last 7 days' : 'Last 30 days'}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text)',
              fontSize: '13px',
            }}
            labelStyle={{ color: 'var(--color-muted)', marginBottom: '4px' }}
            itemStyle={{ color: '#F5A623' }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#F5A623"
            strokeWidth={2}
            fill="url(#dauGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
