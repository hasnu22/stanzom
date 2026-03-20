import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { influencerService, type InfluencerParams } from '@/services/influencerService';
import { sportService } from '@/services/sportService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NICHES = ['Cricket', 'Football', 'Kabaddi', 'Fantasy', 'Betting', 'Analytics', 'Entertainment'];

export default function InfluencerList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<InfluencerParams>({ page: 1, size: 20 });

  const { data: sportsRes } = useQuery({
    queryKey: ['sports'],
    queryFn: () => sportService.getSports(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['influencers', filters],
    queryFn: () => influencerService.getInfluencers(filters),
  });

  const influencers = data?.data ?? [];
  const sports = sportsRes?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-(--color-text)">Influencers</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-(--color-border) bg-(--color-card) p-4">
        <Input
          placeholder="Search influencers..."
          className="w-64"
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
        />

        <select
          className="h-10 rounded-md border border-(--color-border) bg-(--color-card) px-3 text-sm text-(--color-text)"
          value={filters.sportId ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sportId: e.target.value || undefined, page: 1 }))
          }
        >
          <option value="">All Sports</option>
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-(--color-border) bg-(--color-card) px-3 text-sm text-(--color-text)"
          value={filters.niche ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, niche: e.target.value || undefined, page: 1 }))
          }
        >
          <option value="">All Niches</option>
          {NICHES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-(--color-border) bg-(--color-card) px-3 text-sm text-(--color-text)"
          value={filters.isVerified === undefined ? '' : String(filters.isVerified)}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              isVerified: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            }))
          }
        >
          <option value="">All Verified</option>
          <option value="true">Verified</option>
          <option value="false">Not Verified</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-(--color-border)">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-(--color-border) bg-(--color-card)">
            <tr>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Avatar</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Display Name</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Handle</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Niche</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Platform</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Followers</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Verified</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Featured</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Rating</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-(--color-muted)">
                  Loading...
                </td>
              </tr>
            ) : influencers.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-(--color-muted)">
                  No influencers found.
                </td>
              </tr>
            ) : (
              influencers.map((inf) => (
                <tr
                  key={inf.id}
                  className="border-b border-(--color-border) transition-colors hover:bg-(--color-card)"
                >
                  <td className="px-4 py-3">
                    <img
                      src={inf.profileImage || '/placeholder-avatar.png'}
                      alt={inf.displayName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-(--color-text)">{inf.displayName}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{inf.handle ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {inf.niche?.map((n) => (
                        <span
                          key={n}
                          className="inline-flex rounded-full bg-(--color-blue)/20 px-2 py-0.5 text-xs font-medium text-(--color-blue)"
                        >
                          {n}
                        </span>
                      )) ?? '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{inf.platform ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">
                    {inf.followersCount?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    {inf.isVerified ? (
                      <span className="inline-flex rounded-full bg-(--color-green)/20 px-2 py-0.5 text-xs font-medium text-(--color-green)">
                        Verified
                      </span>
                    ) : (
                      <span className="text-(--color-muted)">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {inf.isFeatured ? (
                      <span className="inline-flex rounded-full bg-(--color-gold)/20 px-2 py-0.5 text-xs font-medium text-(--color-gold)">
                        Featured
                      </span>
                    ) : (
                      <span className="text-(--color-muted)">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-(--color-gold)">{inf.rating?.toFixed(1) ?? '-'}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/influencers/${inf.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-(--color-muted)">
            Page {data.page} of {data.totalPages} ({data.totalElements} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
