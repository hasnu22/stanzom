import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

const SPORT_COLORS: Record<string, string> = {
  Cricket: '#4A9EFF',
  Football: '#00E676',
  Kabaddi: '#A855F7',
  Tennis: '#F5A623',
};

const DEFAULT_COLOR = '#48566B';

interface SportEngagementProps {
  data: { sport: string; percent: number }[];
}

export function SportEngagement({ data }: SportEngagementProps) {
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">Sport Engagement</h3>

      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 52)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 40, bottom: 5, left: 5 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="sport"
            tick={{ fontSize: 13, fill: 'var(--color-text)' }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text)',
              fontSize: '13px',
            }}
            formatter={(value: number) => [`${value}%`, 'Engagement']}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="percent" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((entry) => (
              <Cell
                key={entry.sport}
                fill={SPORT_COLORS[entry.sport] ?? DEFAULT_COLOR}
              />
            ))}
            <LabelList
              dataKey="percent"
              position="right"
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 12, fill: 'var(--color-muted)' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
