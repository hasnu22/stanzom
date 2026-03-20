import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { eventService } from '@/services/eventService';
import { sportService } from '@/services/sportService';
import type { Event, Sport } from '@/types';

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  LIVE: 'bg-(--color-green)/15 text-(--color-green)',
  UPCOMING: 'bg-(--color-gold)/15 text-(--color-gold)',
  COMPLETED: 'bg-(--color-muted)/15 text-(--color-muted)',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? STATUS_STYLES.COMPLETED
      }`}
    >
      {status === 'LIVE' && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-(--color-green) animate-pulse" />
      )}
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function SkeletonRow() {
  return (
    <tr className="border-b border-(--color-border) animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 w-20 rounded bg-(--color-border)" />
        </td>
      ))}
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EventList() {
  const navigate = useNavigate();

  const [sportFilter, setSportFilter] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  /* Data */
  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: sportService.getSports,
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', { sport: sportFilter, tournament: tournamentFilter, status: statusFilter }],
    queryFn: () =>
      eventService.getEvents({
        sport_id: sportFilter || undefined,
        tournament_id: tournamentFilter || undefined,
        status: statusFilter || undefined,
      }),
  });

  /* Derive tournaments for selected sport */
  const selectedSport = (sports ?? []).find((s: Sport) => s.id === sportFilter);
  const tournaments = selectedSport?.tournaments ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link to="/events/create">
          <Button>
            <Plus size={16} />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-(--color-card) border border-(--color-border) p-4">
        <Filter size={16} className="text-(--color-muted)" />

        {/* Sport Filter */}
        <select
          value={sportFilter}
          onChange={(e) => {
            setSportFilter(e.target.value);
            setTournamentFilter('');
          }}
          className="h-9 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
        >
          <option value="">All Sports</option>
          {(sports ?? []).map((s: Sport) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Tournament Filter */}
        <select
          value={tournamentFilter}
          onChange={(e) => setTournamentFilter(e.target.value)}
          disabled={!sportFilter}
          className="h-9 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-text) disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
        >
          <option value="">All Tournaments</option>
          {tournaments.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
        >
          <option value="">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-(--color-card) border border-(--color-border) overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-(--color-muted) border-b border-(--color-border) bg-(--color-sidebar)">
              <th className="text-left py-3 px-4">Title</th>
              <th className="text-left py-3 px-4">Sport</th>
              <th className="text-left py-3 px-4">Tournament</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Venue</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : (events ?? []).map((event: Event) => (
                  <tr
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}/live`)}
                    className="border-b border-(--color-border) last:border-0 hover:bg-(--color-bg)/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium">{event.title}</td>
                    <td className="py-3 px-4 text-(--color-muted)">
                      {event.sport_name ?? event.sport_id}
                    </td>
                    <td className="py-3 px-4 text-(--color-muted)">
                      {event.tournament_name ?? event.tournament_id}
                    </td>
                    <td className="py-3 px-4 text-(--color-muted)">
                      {new Date(event.event_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="py-3 px-4 text-(--color-muted)">{event.venue}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/events/${event.id}/live`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!isLoading && (!events || events.length === 0) && (
          <div className="text-center py-12 text-(--color-muted)">
            No events found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
