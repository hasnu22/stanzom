import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { playerService } from '@/services/playerService';
import { sportService } from '@/services/sportService';
import { teamService } from '@/services/teamService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ROLES = [
  'BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER',
  'STRIKER', 'GOALKEEPER', 'MIDFIELDER', 'DEFENDER',
  'RAIDER', 'ALL_ROUNDER_KABADDI',
];

const playerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sportId: z.string().min(1, 'Sport is required'),
  teamId: z.string().optional(),
  role: z.string().optional(),
  nationality: z.string().optional(),
  jerseyNumber: z.coerce.number().int().positive().optional().or(z.literal('')),
  bio: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

export default function PlayerCreate() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: '',
      sportId: '',
      teamId: '',
      role: '',
      nationality: '',
      jerseyNumber: '' as unknown as number,
      bio: '',
      imageUrl: '',
      isActive: true,
    },
  });

  const selectedSportId = watch('sportId');

  // Load existing player for edit mode
  const { data: playerRes } = useQuery({
    queryKey: ['player', id],
    queryFn: () => playerService.getPlayer(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (playerRes?.data) {
      const p = playerRes.data;
      reset({
        name: p.name,
        sportId: p.sportId,
        teamId: p.teamId || '',
        role: p.role || '',
        nationality: p.nationality || '',
        jerseyNumber: p.jerseyNumber ?? ('' as unknown as number),
        bio: p.bio || '',
        imageUrl: p.imageUrl || '',
        isActive: p.isActive,
      });
    }
  }, [playerRes, reset]);

  // Load sports
  const { data: sportsRes } = useQuery({
    queryKey: ['sports'],
    queryFn: () => sportService.getSports(),
  });

  // Load teams filtered by sport
  const { data: teamsRes } = useQuery({
    queryKey: ['teams', selectedSportId],
    queryFn: () => teamService.getTeams({ sportId: selectedSportId }),
    enabled: !!selectedSportId,
  });

  const sports = sportsRes?.data ?? [];
  const teams = teamsRes?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (values: PlayerFormValues) => {
      const payload = {
        ...values,
        jerseyNumber: values.jerseyNumber ? Number(values.jerseyNumber) : undefined,
        imageUrl: values.imageUrl || undefined,
        teamId: values.teamId || undefined,
        role: values.role || undefined,
      };
      return isEdit
        ? playerService.updatePlayer(id!, payload)
        : playerService.createPlayer(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      navigate('/players');
    },
  });

  const onSubmit = (values: PlayerFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/players')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-(--color-text)">
          {isEdit ? 'Edit Player' : 'Create Player'}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl space-y-6 rounded-lg border border-(--color-border) bg-(--color-card) p-6"
      >
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register('name')} placeholder="Player name" />
          {errors.name && <p className="text-xs text-(--color-red)">{errors.name.message}</p>}
        </div>

        {/* Sport */}
        <div className="space-y-2">
          <Label htmlFor="sportId">Sport *</Label>
          <select
            id="sportId"
            {...register('sportId')}
            className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text)"
          >
            <option value="">Select a sport</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.sportId && <p className="text-xs text-(--color-red)">{errors.sportId.message}</p>}
        </div>

        {/* Team */}
        <div className="space-y-2">
          <Label htmlFor="teamId">Team</Label>
          <select
            id="teamId"
            {...register('teamId')}
            disabled={!selectedSportId}
            className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text) disabled:opacity-50"
          >
            <option value="">Select a team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortName} - {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            {...register('role')}
            className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text)"
          >
            <option value="">Select a role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="nationality">Country</Label>
          <Input id="nationality" {...register('nationality')} placeholder="e.g. India" />
        </div>

        {/* Jersey Number */}
        <div className="space-y-2">
          <Label htmlFor="jerseyNumber">Jersey Number</Label>
          <Input
            id="jerseyNumber"
            type="number"
            {...register('jerseyNumber')}
            placeholder="e.g. 18"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={4}
            placeholder="Player biography..."
            className="flex w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-gold) focus:ring-offset-2 focus:ring-offset-(--color-bg)"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." />
          {errors.imageUrl && <p className="text-xs text-(--color-red)">{errors.imageUrl.message}</p>}
        </div>

        {/* Active Switch */}
        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-(--color-border) transition-colors checked:bg-(--color-gold) relative
              before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform
              checked:before:translate-x-4"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        {/* Error */}
        {createMutation.isError && (
          <p className="text-sm text-(--color-red)">
            Failed to {isEdit ? 'update' : 'create'} player. Please try again.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Update Player' : 'Create Player'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/players')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
