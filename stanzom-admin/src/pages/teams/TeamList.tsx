import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { teamService, type TeamParams } from '@/services/teamService';
import { sportService } from '@/services/sportService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TeamList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TeamParams>({ page: 1, size: 20 });

  const { data: sportsRes } = useQuery({
    queryKey: ['sports'],
    queryFn: () => sportService.getSports(),
  });

  const { data: tournamentsRes } = useQuery({
    queryKey: ['tournaments', filters.sportId],
    queryFn: () => sportService.getTournaments({ sportId: filters.sportId }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['teams', filters],
    queryFn: () => teamService.getTeams(filters),
  });

  const teams = data?.data ?? [];
  const sports = sportsRes?.data ?? [];
  const tournaments = tournamentsRes?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-(--color-text)">Teams</h1>
        <Button onClick={() => navigate('/teams/create')}>
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-(--color-border) bg-(--color-card) p-4">
        <Input
          placeholder="Search teams..."
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
          value={filters.tournamentId ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, tournamentId: e.target.value || undefined, page: 1 }))
          }
        >
          <option value="">All Tournaments</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-(--color-border)">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-(--color-border) bg-(--color-card)">
            <tr>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Logo</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Short Name</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Full Name</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Sport</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">City</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Followers</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Rating</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Titles</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-(--color-muted)">
                  Loading...
                </td>
              </tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-(--color-muted)">
                  No teams found.
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr
                  key={team.id}
                  className="border-b border-(--color-border) transition-colors hover:bg-(--color-card)"
                >
                  <td className="px-4 py-3">
                    <img
                      src={team.logo || '/placeholder-team.png'}
                      alt={team.shortName}
                      className="h-8 w-8 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-(--color-text)">{team.shortName}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{team.fullName || team.name}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{team.sport?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{team.city ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{team.followersCount?.toLocaleString() ?? 0}</td>
                  <td className="px-4 py-3 text-(--color-gold)">{team.rating?.toFixed(1) ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{team.titles ?? 0}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/teams/${team.id}/edit`)}
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
