import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import { playerService, type PlayerParams } from '@/services/playerService';
import { sportService } from '@/services/sportService';
import { teamService } from '@/services/teamService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ROLES = [
  'BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER',
  'STRIKER', 'GOALKEEPER', 'MIDFIELDER', 'DEFENDER',
  'RAIDER', 'ALL_ROUNDER_KABADDI',
];

export default function PlayerList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PlayerParams>({ page: 1, size: 20 });

  const { data: sportsRes } = useQuery({
    queryKey: ['sports'],
    queryFn: () => sportService.getSports(),
  });

  const { data: teamsRes } = useQuery({
    queryKey: ['teams', filters.sportId],
    queryFn: () => teamService.getTeams({ sportId: filters.sportId }),
    enabled: !!filters.sportId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['players', filters],
    queryFn: () => playerService.getPlayers(filters),
  });

  const players = data?.data ?? [];
  const sports = sportsRes?.data ?? [];
  const teams = teamsRes?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-(--color-text)">Players</h1>
        <Button onClick={() => navigate('/players/create')}>
          <Plus className="h-4 w-4" />
          Create Player
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-(--color-border) bg-(--color-card) p-4">
        <Input
          placeholder="Search players..."
          className="w-64"
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
        />

        <select
          className="h-10 rounded-md border border-(--color-border) bg-(--color-card) px-3 text-sm text-(--color-text)"
          value={filters.sportId ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sportId: e.target.value || undefined, teamId: undefined, page: 1 }))
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
          value={filters.teamId ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, teamId: e.target.value || undefined, page: 1 }))}
          disabled={!filters.sportId}
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.shortName}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-(--color-border) bg-(--color-card) px-3 text-sm text-(--color-text)"
          value={filters.role ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value || undefined, page: 1 }))}
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-md border border-(--color-border) bg-(--color-card) px-3 text-sm text-(--color-text)"
          value={filters.isActive === undefined ? '' : String(filters.isActive)}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              isActive: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            }))
          }
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-(--color-border)">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-(--color-border) bg-(--color-card)">
            <tr>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Image</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Name</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Sport</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Team</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Role</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Country</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Jersey #</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Followers</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Rating</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Active</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-(--color-muted)">
                  Loading...
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-(--color-muted)">
                  No players found.
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-(--color-border) transition-colors hover:bg-(--color-card) cursor-pointer"
                  onClick={() => navigate(`/players/${player.id}`)}
                >
                  <td className="px-4 py-3">
                    <img
                      src={player.imageUrl || player.photo || '/placeholder-avatar.png'}
                      alt={player.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-(--color-text)">{player.name}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{player.sport?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{player.team?.shortName ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{player.role?.replace(/_/g, ' ') ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{player.nationality ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{player.jerseyNumber ?? '-'}</td>
                  <td className="px-4 py-3 text-(--color-muted)">{player.followersCount?.toLocaleString() ?? 0}</td>
                  <td className="px-4 py-3 text-(--color-gold)">{player.rating?.toFixed(1) ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        player.isActive
                          ? 'bg-(--color-green)/20 text-(--color-green)'
                          : 'bg-(--color-red)/20 text-(--color-red)'
                      }`}
                    >
                      {player.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/players/${player.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
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
