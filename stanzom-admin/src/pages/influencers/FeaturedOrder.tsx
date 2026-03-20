import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';
import { influencerService } from '@/services/influencerService';
import type { Influencer } from '@/types';
import { Button } from '@/components/ui/button';

function SortableItem({ influencer, index }: { influencer: Influencer; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: influencer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-lg border border-(--color-border) bg-(--color-card) p-4 ${
        isDragging ? 'shadow-lg shadow-black/30 opacity-90' : ''
      }`}
    >
      <button
        className="cursor-grab touch-none text-(--color-muted) hover:text-(--color-text) active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-gold)/20 text-sm font-bold text-(--color-gold)">
        {index + 1}
      </span>

      <img
        src={influencer.profileImage || '/placeholder-avatar.png'}
        alt={influencer.displayName}
        className="h-10 w-10 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="font-medium text-(--color-text)">{influencer.displayName}</p>
        {influencer.handle && (
          <p className="text-sm text-(--color-muted)">@{influencer.handle}</p>
        )}
      </div>
    </div>
  );
}

export default function FeaturedOrder() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Influencer[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data, isLoading } = useQuery({
    queryKey: ['featured-influencers'],
    queryFn: () => influencerService.getFeaturedInfluencers(),
  });

  useEffect(() => {
    if (data?.data) {
      setItems(data.data.sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0)));
      setHasChanges(false);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (ids: string[]) => influencerService.updateFeaturedOrder(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-influencers'] });
      setHasChanges(false);
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setHasChanges(true);
  }

  function handleSave() {
    saveMutation.mutate(items.map((item) => item.id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-(--color-text)">Featured Influencers Order</h1>
      </div>

      <p className="text-sm text-(--color-muted)">
        Drag and drop to reorder featured influencers. Changes are saved when you click the Save
        button.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12 text-(--color-muted)">Loading...</div>
      ) : items.length === 0 ? (
        <div className="flex justify-center py-12 text-(--color-muted)">
          No featured influencers found.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="max-w-xl space-y-2">
              {items.map((influencer, index) => (
                <SortableItem key={influencer.id} influencer={influencer} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Save Button */}
      {items.length > 0 && (
        <div className="max-w-xl">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
            className="w-full"
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Order
          </Button>
          {saveMutation.isSuccess && (
            <p className="mt-2 text-center text-sm text-(--color-green)">Order saved successfully!</p>
          )}
          {saveMutation.isError && (
            <p className="mt-2 text-center text-sm text-(--color-red)">Failed to save order. Please try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
