import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sportService } from '@/services/sportService';

/* ------------------------------------------------------------------ */
/*  Schemas                                                            */
/* ------------------------------------------------------------------ */

const tournamentSchema = z.object({
  name: z.string().min(1, 'Tournament name is required'),
  slug: z.string().min(1, 'Slug is required'),
  season: z.string().min(1, 'Season is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  logo_url: z.string().url('Must be a valid URL').or(z.literal('')),
  is_active: z.boolean(),
});

const sportSchema = z.object({
  name: z.string().min(1, 'Sport name is required'),
  slug: z.string().min(1, 'Slug is required'),
  icon_url: z.string().url('Must be a valid URL').or(z.literal('')),
  is_active: z.boolean(),
  display_order: z.coerce.number().int().min(0),
  tournaments: z.array(tournamentSchema),
});

type SportFormValues = z.infer<typeof sportSchema>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SportCreate() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* Fetch existing sport when editing */
  const { data: existingSport } = useQuery({
    queryKey: ['sport', id],
    queryFn: () => sportService.getSport(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SportFormValues>({
    resolver: zodResolver(sportSchema),
    defaultValues: {
      name: '',
      slug: '',
      icon_url: '',
      is_active: true,
      display_order: 0,
      tournaments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tournaments',
  });

  /* Populate form when editing */
  useEffect(() => {
    if (existingSport) {
      reset({
        name: existingSport.name,
        slug: existingSport.slug,
        icon_url: existingSport.icon_url ?? '',
        is_active: existingSport.is_active,
        display_order: existingSport.display_order,
        tournaments: existingSport.tournaments ?? [],
      });
    }
  }, [existingSport, reset]);

  /* Auto-generate slug from name */
  const nameValue = watch('name');
  useEffect(() => {
    if (!isEditing) {
      setValue('slug', slugify(nameValue));
    }
  }, [nameValue, isEditing, setValue]);

  /* Mutations */
  const createMutation = useMutation({
    mutationFn: sportService.createSport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
      navigate('/sports');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SportFormValues) => sportService.updateSport(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
      queryClient.invalidateQueries({ queryKey: ['sport', id] });
      navigate('/sports');
    },
  });

  function onSubmit(data: SportFormValues) {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const mutationError = createMutation.error || updateMutation.error;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sports')}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Sport' : 'Create Sport'}
        </h1>
      </div>

      {mutationError && (
        <div className="rounded-lg bg-(--color-red)/10 border border-(--color-red)/30 p-4 text-sm text-(--color-red)">
          {(mutationError as Error).message ?? 'Something went wrong'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Sport Fields */}
        <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-6 space-y-5">
          <h2 className="text-lg font-semibold">Sport Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Cricket" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-(--color-red)">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="cricket" {...register('slug')} />
              {errors.slug && (
                <p className="text-xs text-(--color-red)">{errors.slug.message}</p>
              )}
            </div>

            {/* Icon URL */}
            <div className="space-y-2">
              <Label htmlFor="icon_url">Icon URL</Label>
              <Input
                id="icon_url"
                placeholder="https://..."
                {...register('icon_url')}
              />
              {errors.icon_url && (
                <p className="text-xs text-(--color-red)">{errors.icon_url.message}</p>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min={0}
                {...register('display_order')}
              />
              {errors.display_order && (
                <p className="text-xs text-(--color-red)">
                  {errors.display_order.message}
                </p>
              )}
            </div>
          </div>

          {/* Active switch */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-(--color-border) transition-colors checked:bg-(--color-green) relative
                after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform checked:after:translate-x-5"
              {...register('is_active')}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>

        {/* Tournaments Section */}
        <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tournaments</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: '',
                  slug: '',
                  season: '',
                  start_date: '',
                  end_date: '',
                  logo_url: '',
                  is_active: true,
                })
              }
            >
              <Plus size={14} />
              Add Tournament
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-(--color-muted)">
              No tournaments yet. Click "Add Tournament" to create one.
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-(--color-border) p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-(--color-muted)">
                  Tournament #{index + 1}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-(--color-red)"
                  onClick={() => remove(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="IPL 2026"
                    {...register(`tournaments.${index}.name`)}
                  />
                  {errors.tournaments?.[index]?.name && (
                    <p className="text-xs text-(--color-red)">
                      {errors.tournaments[index].name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    placeholder="ipl-2026"
                    {...register(`tournaments.${index}.slug`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Season</Label>
                  <Input
                    placeholder="2026"
                    {...register(`tournaments.${index}.season`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    placeholder="https://..."
                    {...register(`tournaments.${index}.logo_url`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    {...register(`tournaments.${index}.start_date`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    {...register(`tournaments.${index}.end_date`)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`tournament_active_${index}`}
                  className="h-5 w-10 cursor-pointer appearance-none rounded-full bg-(--color-border) transition-colors checked:bg-(--color-green) relative
                    after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform checked:after:translate-x-5"
                  {...register(`tournaments.${index}.is_active`)}
                />
                <Label htmlFor={`tournament_active_${index}`}>Active</Label>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save size={16} />
            {isEditing ? 'Update Sport' : 'Create Sport'}
          </Button>
        </div>
      </form>
    </div>
  );
}
