import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_COLORS: Record<string, string> = {
  WhatsApp: '#25D366',
  Telegram: '#0088CC',
  X: '#1DA1F2',
  Instagram: '#E1306C',
  Snapchat: '#FF6B35',
  Room: '#A855F7',
  Copy: '#48566B',
};

interface SharesBreakdownProps {
  data: Record<string, number>;
}

export function SharesBreakdown({ data }: SharesBreakdownProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">Shares by Platform</h3>

      <div className="flex items-center gap-6">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={PLATFORM_COLORS[entry.name] ?? '#48566B'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {chartData.map((entry) => {
            const color = PLATFORM_COLORS[entry.name] ?? '#48566B';
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';

            return (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted">{entry.name}</span>
                <span className="ml-auto font-medium text-text tabular-nums">
                  {entry.value.toLocaleString()}
                </span>
                <span className="text-xs text-muted">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
