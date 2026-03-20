import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sportService } from '@/services/sportService';
import type { Sport } from '@/types';

function SkeletonRow() {
  return (
    <tr className="border-b border-(--color-border) animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 w-24 rounded bg-(--color-border)" />
        </td>
      ))}
    </tr>
  );
}

export default function SportList() {
  const { data: sports, isLoading } = useQuery({
    queryKey: ['sports'],
    queryFn: sportService.getSports,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sports</h1>
        <Link to="/sports/create">
          <Button>
            <Plus size={16} />
            New Sport
          </Button>
        </Link>
      </div>

      <div className="rounded-xl bg-(--color-card) border border-(--color-border) overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-(--color-muted) border-b border-(--color-border) bg-(--color-sidebar)">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Slug</th>
              <th className="text-left py-3 px-4">Active</th>
              <th className="text-left py-3 px-4">Display Order</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : (sports ?? []).map((sport: Sport) => (
                  <tr
                    key={sport.id}
                    className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg)/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{sport.name}</td>
                    <td className="py-3 px-4 text-(--color-muted)">{sport.slug}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          sport.is_active
                            ? 'bg-(--color-green)/15 text-(--color-green)'
                            : 'bg-(--color-muted)/15 text-(--color-muted)'
                        }`}
                      >
                        {sport.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{sport.display_order}</td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/sports/${sport.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!isLoading && (!sports || sports.length === 0) && (
          <div className="text-center py-12 text-(--color-muted)">
            No sports found. Create your first sport to get started.
          </div>
        )}
      </div>
    </div>
  );
}
