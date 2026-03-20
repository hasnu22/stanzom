import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  className?: string;
}

function StatCard({ icon, label, value, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-(--color-border) bg-(--color-card) p-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="rounded-md bg-(--color-bg) p-2 text-(--color-gold)">
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.direction === 'up' ? 'text-(--color-green)' : 'text-(--color-red)'
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{trend.percentage}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-(--color-muted)">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-(--color-text)">{value}</p>
      </div>
    </div>
  );
}

export { StatCard };
export type { StatCardProps };
