import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { eventService } from '@/services/eventService';
import { sportService } from '@/services/sportService';
import type { Sport } from '@/types';

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const eventSchema = z.object({
  sport_id: z.string().min(1, 'Sport is required'),
  tournament_id: z.string().min(1, 'Tournament is required'),
  event_type: z.enum(['MATCH', 'CONCERT', 'ESPORTS'], {
    required_error: 'Event type is required',
  }),
  title: z.string().min(1, 'Title is required'),
  team_home_id: z.string().min(1, 'Home team is required'),
  team_away_id: z.string().min(1, 'Away team is required'),
  event_date: z.string().min(1, 'Event date is required'),
  venue: z.string().min(1, 'Venue is required'),
});

type EventFormValues = z.infer<typeof eventSchema>;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EventCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      sport_id: '',
      tournament_id: '',
      event_type: 'MATCH',
      title: '',
      team_home_id: '',
      team_away_id: '',
      event_date: '',
      venue: '',
    },
  });

  const sportId = watch('sport_id');

  /* Fetch sports */
  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: sportService.getSports,
  });

  /* Derive tournaments from selected sport */
  const selectedSport = (sports ?? []).find((s: Sport) => s.id === sportId);
  const tournaments = selectedSport?.tournaments ?? [];

  /* Fetch teams for selected sport */
  const { data: teams } = useQuery({
    queryKey: ['teams', sportId],
    queryFn: () => sportService.getTeams(sportId),
    enabled: Boolean(sportId),
  });

  /* Create mutation */
  const createMutation = useMutation({
    mutationFn: eventService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
  });

  function onSubmit(data: EventFormValues) {
    createMutation.mutate(data);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>

      {createMutation.error && (
        <div className="rounded-lg bg-(--color-red)/10 border border-(--color-red)/30 p-4 text-sm text-(--color-red)">
          {(createMutation.error as Error).message ?? 'Something went wrong'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-6 space-y-5">
          <h2 className="text-lg font-semibold">Event Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Sport */}
            <div className="space-y-2">
              <Label htmlFor="sport_id">Sport</Label>
              <select
                id="sport_id"
                {...register('sport_id')}
                className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
              >
                <option value="">Select sport...</option>
                {(sports ?? []).map((s: Sport) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.sport_id && (
                <p className="text-xs text-(--color-red)">{errors.sport_id.message}</p>
              )}
            </div>

            {/* Tournament */}
            <div className="space-y-2">
              <Label htmlFor="tournament_id">Tournament</Label>
              <select
                id="tournament_id"
                {...register('tournament_id')}
                disabled={!sportId}
                className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text) disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
              >
                <option value="">Select tournament...</option>
                {tournaments.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.tournament_id && (
                <p className="text-xs text-(--color-red)">
                  {errors.tournament_id.message}
                </p>
              )}
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type</Label>
              <select
                id="event_type"
                {...register('event_type')}
                className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
              >
                <option value="MATCH">Match</option>
                <option value="CONCERT">Concert</option>
                <option value="ESPORTS">Esports</option>
              </select>
              {errors.event_type && (
                <p className="text-xs text-(--color-red)">{errors.event_type.message}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="MI vs CSK" {...register('title')} />
              {errors.title && (
                <p className="text-xs text-(--color-red)">{errors.title.message}</p>
              )}
            </div>

            {/* Home Team */}
            <div className="space-y-2">
              <Label htmlFor="team_home_id">Home Team</Label>
              <select
                id="team_home_id"
                {...register('team_home_id')}
                disabled={!sportId}
                className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text) disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
              >
                <option value="">Select home team...</option>
                {(teams ?? []).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.team_home_id && (
                <p className="text-xs text-(--color-red)">
                  {errors.team_home_id.message}
                </p>
              )}
            </div>

            {/* Away Team */}
            <div className="space-y-2">
              <Label htmlFor="team_away_id">Away Team</Label>
              <select
                id="team_away_id"
                {...register('team_away_id')}
                disabled={!sportId}
                className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text) disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
              >
                <option value="">Select away team...</option>
                {(teams ?? []).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.team_away_id && (
                <p className="text-xs text-(--color-red)">
                  {errors.team_away_id.message}
                </p>
              )}
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date & Time</Label>
              <Input
                id="event_date"
                type="datetime-local"
                {...register('event_date')}
              />
              {errors.event_date && (
                <p className="text-xs text-(--color-red)">
                  {errors.event_date.message}
                </p>
              )}
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="Wankhede Stadium, Mumbai"
                {...register('venue')}
              />
              {errors.venue && (
                <p className="text-xs text-(--color-red)">{errors.venue.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} />
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}
