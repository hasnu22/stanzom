import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { teamService } from '@/services/teamService';
import { sportService } from '@/services/sportService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const teamSchema = z.object({
  sportId: z.string().min(1, 'Sport is required'),
  tournamentId: z.string().optional(),
  shortName: z.string().min(1, 'Short name is required'),
  fullName: z.string().optional(),
  city: z.string().optional(),
  homeGround: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  foundedYear: z.coerce.number().int().min(1800).max(2100).optional().or(z.literal('')),
  titles: z.coerce.number().int().min(0).optional().or(z.literal('')),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function TeamCreate() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      sportId: '',
      tournamentId: '',
      shortName: '',
      fullName: '',
      city: '',
      homeGround: '',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      logoUrl: '',
      foundedYear: '' as unknown as number,
      titles: '' as unknown as number,
    },
  });

  const selectedSportId = watch('sportId');

  // Load existing team for edit mode
  const { data: teamRes } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getTeam(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (teamRes?.data) {
      const t = teamRes.data;
      reset({
        sportId: t.sportId,
        tournamentId: t.tournamentId || '',
        shortName: t.shortName,
        fullName: t.fullName || '',
        city: t.city || '',
        homeGround: t.homeGround || '',
        primaryColor: t.primaryColor || '#000000',
        secondaryColor: t.secondaryColor || '#ffffff',
        logoUrl: t.logo || '',
        foundedYear: t.foundedYear ?? ('' as unknown as number),
        titles: t.titles ?? ('' as unknown as number),
      });
    }
  }, [teamRes, reset]);

  // Load sports
  const { data: sportsRes } = useQuery({
    queryKey: ['sports'],
    queryFn: () => sportService.getSports(),
  });

  // Load tournaments filtered by sport
  const { data: tournamentsRes } = useQuery({
    queryKey: ['tournaments', selectedSportId],
    queryFn: () => sportService.getTournaments({ sportId: selectedSportId }),
    enabled: !!selectedSportId,
  });

  const sports = sportsRes?.data ?? [];
  const tournaments = tournamentsRes?.data ?? [];

  const mutation = useMutation({
    mutationFn: (values: TeamFormValues) => {
      const payload = {
        ...values,
        name: values.fullName || values.shortName,
        foundedYear: values.foundedYear ? Number(values.foundedYear) : undefined,
        titles: values.titles ? Number(values.titles) : undefined,
        logoUrl: values.logoUrl || undefined,
        tournamentId: values.tournamentId || undefined,
      };
      return isEdit
        ? teamService.updateTeam(id!, payload)
        : teamService.createTeam(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      navigate('/teams');
    },
  });

  const onSubmit = (values: TeamFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/teams')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-(--color-text)">
          {isEdit ? 'Edit Team' : 'Create Team'}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl space-y-6 rounded-lg border border-(--color-border) bg-(--color-card) p-6"
      >
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

        {/* Tournament */}
        <div className="space-y-2">
          <Label htmlFor="tournamentId">Tournament</Label>
          <select
            id="tournamentId"
            {...register('tournamentId')}
            disabled={!selectedSportId}
            className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm text-(--color-text) disabled:opacity-50"
          >
            <option value="">Select a tournament</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Short Name */}
        <div className="space-y-2">
          <Label htmlFor="shortName">Short Name *</Label>
          <Input id="shortName" {...register('shortName')} placeholder="e.g. CSK" />
          {errors.shortName && <p className="text-xs text-(--color-red)">{errors.shortName.message}</p>}
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register('fullName')} placeholder="e.g. Chennai Super Kings" />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} placeholder="e.g. Chennai" />
        </div>

        {/* Home Ground */}
        <div className="space-y-2">
          <Label htmlFor="homeGround">Home Ground</Label>
          <Input id="homeGround" {...register('homeGround')} placeholder="e.g. M.A. Chidambaram Stadium" />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="primaryColor"
                type="color"
                {...register('primaryColor')}
                className="h-10 w-14 cursor-pointer rounded border border-(--color-border) bg-transparent p-1"
              />
              <Input {...register('primaryColor')} className="flex-1" placeholder="#000000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="secondaryColor"
                type="color"
                {...register('secondaryColor')}
                className="h-10 w-14 cursor-pointer rounded border border-(--color-border) bg-transparent p-1"
              />
              <Input {...register('secondaryColor')} className="flex-1" placeholder="#ffffff" />
            </div>
          </div>
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" {...register('logoUrl')} placeholder="https://..." />
          {errors.logoUrl && <p className="text-xs text-(--color-red)">{errors.logoUrl.message}</p>}
        </div>

        {/* Founded Year & Titles */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foundedYear">Founded Year</Label>
            <Input
              id="foundedYear"
              type="number"
              {...register('foundedYear')}
              placeholder="e.g. 2008"
            />
            {errors.foundedYear && (
              <p className="text-xs text-(--color-red)">{errors.foundedYear.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="titles">Titles</Label>
            <Input id="titles" type="number" {...register('titles')} placeholder="e.g. 5" />
          </div>
        </div>

        {/* Error */}
        {mutation.isError && (
          <p className="text-sm text-(--color-red)">
            Failed to {isEdit ? 'update' : 'create'} team. Please try again.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Update Team' : 'Create Team'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teams')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
