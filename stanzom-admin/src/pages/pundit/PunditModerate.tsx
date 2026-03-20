import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, EyeOff, Eye, Expand, X } from 'lucide-react';
import { punditService, type PunditPostParams } from '@/services/punditService';
import { sportService } from '@/services/sportService';
import { eventService } from '@/services/eventService';
import type { PunditPost } from '@/types';
import { Button } from '@/components/ui/button';

const AUDIENCE_TYPES = ['PUBLIC', 'PREMIUM', 'VIP'];

export default function PunditModerate() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PunditPostParams>({ page: 1, size: 20 });
  const [selectedPost, setSelectedPost] = useState<PunditPost | null>(null);

  const { data: sportsRes } = useQuery({
    queryKey: ['sports'],
    queryFn: () => sportService.getSports(),
  });

  const { data: eventsRes } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getEvents({ size: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['pundit-posts', filters],
    queryFn: () => punditService.getPosts(filters),
  });

  const featureMutation = useMutation({
    mutationFn: (id: string) => punditService.featurePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pundit-posts'] }),
  });

  const hideMutation = useMutation({
    mutationFn: (id: string) => punditService.hidePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pundit-posts'] }),
  });

  const posts = data?.data ?? [];
  const sports = sportsRes?.data ?? [];
  const events = eventsRes?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-(--color-text)">Pundit Wall Moderation</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-(--color-border) bg-(--color-card) p-4">
        <select
          className="h-10 rounded-md border border-(--color-border) bg-(--color-card) px-3 text-sm text-(--color-text)"
          value={filters.eventId ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, eventId: e.target.value || undefined, page: 1 }))
          }
        >
          <option value="">All Events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>

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
          value={filters.audienceType ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, audienceType: e.target.value || undefined, page: 1 }))
          }
        >
          <option value="">All Audiences</option>
          {AUDIENCE_TYPES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-(--color-border)">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-(--color-border) bg-(--color-card)">
            <tr>
              <th className="px-4 py-3 font-medium text-(--color-muted)">User</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Event</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Take Text</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Accuracy</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Likes</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Auto-generated</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Created At</th>
              <th className="px-4 py-3 font-medium text-(--color-muted)">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-(--color-muted)">
                  Loading...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-(--color-muted)">
                  No posts found.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className={`border-b border-(--color-border) transition-colors hover:bg-(--color-card) ${
                    post.isHidden ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-(--color-text)">
                    {post.user?.name ?? 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{post.event?.title ?? '-'}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-(--color-muted)">{post.content}</td>
                  <td className="px-4 py-3 text-(--color-gold)">
                    {post.accuracy != null ? `${post.accuracy}%` : '-'}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">{post.likesCount}</td>
                  <td className="px-4 py-3">
                    {post.isAutoGenerated ? (
                      <span className="inline-flex rounded-full bg-(--color-purple)/20 px-2 py-0.5 text-xs font-medium text-(--color-purple)">
                        Auto
                      </span>
                    ) : (
                      <span className="text-(--color-muted)">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-(--color-muted)">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title={post.isFeatured ? 'Unfeature' : 'Feature'}
                        onClick={() => featureMutation.mutate(post.id)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            post.isFeatured ? 'fill-(--color-gold) text-(--color-gold)' : ''
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={post.isHidden ? 'Show' : 'Hide'}
                        onClick={() => hideMutation.mutate(post.id)}
                      >
                        {post.isHidden ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Full"
                        onClick={() => setSelectedPost(post)}
                      >
                        <Expand className="h-4 w-4" />
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

      {/* Full Post Dialog */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-lg rounded-lg border border-(--color-border) bg-(--color-card) p-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              onClick={() => setSelectedPost(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            <h2 className="mb-4 text-lg font-bold text-(--color-text)">Pundit Post</h2>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-(--color-muted)">User</span>
                <p className="text-(--color-text)">{selectedPost.user?.name ?? 'Unknown'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-(--color-muted)">Event</span>
                <p className="text-(--color-text)">{selectedPost.event?.title ?? '-'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-(--color-muted)">Take</span>
                <p className="whitespace-pre-wrap text-(--color-text)">{selectedPost.content}</p>
              </div>

              {selectedPost.picks && selectedPost.picks.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-(--color-muted)">Picks</span>
                  <ul className="mt-1 space-y-1">
                    {selectedPost.picks.map((pick) => (
                      <li
                        key={pick.id}
                        className="flex items-center gap-2 text-sm text-(--color-text)"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            pick.isCorrect === true
                              ? 'bg-(--color-green)'
                              : pick.isCorrect === false
                                ? 'bg-(--color-red)'
                                : 'bg-(--color-muted)'
                          }`}
                        />
                        {pick.question}: {pick.selectedOption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-(--color-muted)">Accuracy: </span>
                  <span className="text-(--color-gold)">
                    {selectedPost.accuracy != null ? `${selectedPost.accuracy}%` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-(--color-muted)">Likes: </span>
                  <span className="text-(--color-text)">{selectedPost.likesCount}</span>
                </div>
                <div>
                  <span className="text-(--color-muted)">Comments: </span>
                  <span className="text-(--color-text)">{selectedPost.commentsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
