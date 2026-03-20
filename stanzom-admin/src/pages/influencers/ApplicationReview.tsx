import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, X, Loader2 } from 'lucide-react';
import { influencerService, type ApplicationParams } from '@/services/influencerService';
import type { InfluencerApplication } from '@/types';
import { Button } from '@/components/ui/button';

export default function ApplicationReview() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ApplicationParams>({ page: 1, size: 20, status: 'PENDING' });
  const [rejectTarget, setRejectTarget] = useState<InfluencerApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['influencer-applications', filters],
    queryFn: () => influencerService.getApplications(filters),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => influencerService.approveApplication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['influencer-applications'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      influencerService.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-applications'] });
      setRejectTarget(null);
      setRejectReason('');
    },
  });

  const applications = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-(--color-text)">Application Review</h1>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <Button
            key={status}
            variant={filters.status === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters((f) => ({ ...f, status, page: 1 }))}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12 text-(--color-muted)">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="flex justify-center py-12 text-(--color-muted)">No applications found.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex flex-col rounded-lg border border-(--color-border) bg-(--color-card) p-5"
            >
              {/* Applicant Info */}
              <div className="mb-4 space-y-2">
                <h3 className="text-lg font-semibold text-(--color-text)">{app.displayName}</h3>
                {app.socialHandle && (
                  <p className="text-sm text-(--color-muted)">@{app.socialHandle}</p>
                )}
                <p className="text-sm text-(--color-text) line-clamp-3">{app.bio}</p>

                {/* Niche tags */}
                {app.niche && app.niche.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {app.niche.map((n) => (
                      <span
                        key={n}
                        className="inline-flex rounded-full bg-(--color-blue)/20 px-2 py-0.5 text-xs font-medium text-(--color-blue)"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}

                {app.followerCount != null && (
                  <p className="text-sm text-(--color-muted)">
                    {app.followerCount.toLocaleString()} followers
                  </p>
                )}
              </div>

              {/* Stanzom Stats */}
              {app.stanzomStats && (
                <div className="mb-4 rounded-md border border-(--color-border) bg-(--color-bg) p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-(--color-muted)">
                    Stanzom Stats
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-(--color-gold)">
                        {app.stanzomStats.predictionAccuracy}%
                      </p>
                      <p className="text-xs text-(--color-muted)">Accuracy</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-(--color-text)">
                        {app.stanzomStats.totalPoints.toLocaleString()}
                      </p>
                      <p className="text-xs text-(--color-muted)">Points</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-(--color-text)">
                        {app.stanzomStats.activeDays}
                      </p>
                      <p className="text-xs text-(--color-muted)">Active Days</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {app.status === 'PENDING' && (
                <div className="mt-auto flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-(--color-green) text-white hover:bg-(--color-green)/80"
                    onClick={() => approveMutation.mutate(app.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setRejectTarget(app)}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}

              {app.status === 'APPROVED' && (
                <div className="mt-auto pt-2">
                  <span className="inline-flex rounded-full bg-(--color-green)/20 px-3 py-1 text-sm font-medium text-(--color-green)">
                    Approved
                  </span>
                </div>
              )}

              {app.status === 'REJECTED' && (
                <div className="mt-auto space-y-1 pt-2">
                  <span className="inline-flex rounded-full bg-(--color-red)/20 px-3 py-1 text-sm font-medium text-(--color-red)">
                    Rejected
                  </span>
                  {app.rejectionReason && (
                    <p className="text-xs text-(--color-muted)">Reason: {app.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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

      {/* Reject Dialog */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-md rounded-lg border border-(--color-border) bg-(--color-card) p-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>

            <h2 className="mb-4 text-lg font-bold text-(--color-text)">
              Reject Application
            </h2>
            <p className="mb-4 text-sm text-(--color-muted)">
              Rejecting application from <span className="text-(--color-text)">{rejectTarget.displayName}</span>.
              Please provide a reason.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Reason for rejection..."
              className="mb-4 flex w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
            />

            <div className="flex gap-3">
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() =>
                  rejectMutation.mutate({
                    id: rejectTarget.id,
                    reason: rejectReason.trim(),
                  })
                }
              >
                {rejectMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
