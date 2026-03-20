import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { notificationService, type NotificationTargetType, type NotificationHistoryEntry } from '@/services/notificationService';

const TARGETS: { value: NotificationTargetType; label: string }[] = [
  { value: 'ALL_USERS', label: 'All Users' },
  { value: 'CITY', label: 'By City' },
  { value: 'STATE', label: 'By State' },
  { value: 'TEAM_FOLLOWERS', label: 'Team Followers' },
  { value: 'PLAYER_FOLLOWERS', label: 'Player Followers' },
  { value: 'SPORT_FOLLOWERS', label: 'Sport Followers' },
];

const TEMPLATES = [
  { id: 'match_starting', name: 'Match starting in 30 min', title: 'Match Alert!', body: 'The match is starting in 30 minutes. Make your predictions now!' },
  { id: 'daily_prize', name: 'Daily prize winner', title: 'Daily Prize Winner!', body: 'Congratulations! Check if you are the lucky winner.' },
  { id: 'new_influencer', name: 'New influencer joined', title: 'New Influencer!', body: 'A new sports influencer has joined Stanzom. Check out their predictions!' },
  { id: 'platform_update', name: 'Platform update', title: 'Platform Update!', body: 'We have added exciting new features. Update your app now!' },
];

const schema = z.object({
  targetType: z.string().min(1, 'Target type is required'),
  targetId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100),
  body: z.string().min(1, 'Body is required').max(500),
});

type FormData = z.infer<typeof schema>;

export default function PushSender() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const qc = useQueryClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { targetType: 'ALL_USERS', targetId: '', title: '', body: '' },
  });

  const targetType = watch('targetType') as NotificationTargetType;

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['notification-history'],
    queryFn: () => notificationService.getHistory(),
  });

  const sendMutation = useMutation({
    mutationFn: notificationService.send,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-history'] });
      reset(); setConfirmOpen(false); setPendingData(null);
    },
  });

  const onSubmit = (data: FormData) => { setPendingData(data); setConfirmOpen(true); };

  const confirmSend = () => {
    if (!pendingData) return;
    sendMutation.mutate({
      targetType: pendingData.targetType as NotificationTargetType,
      targetId: pendingData.targetId || undefined,
      title: pendingData.title,
      body: pendingData.body,
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    const t = TEMPLATES.find((tp) => tp.id === templateId);
    if (t) { setValue('title', t.title); setValue('body', t.body); }
  };

  const needsTargetId = targetType !== 'ALL_USERS';
  const targetLabel: Record<string, string> = {
    CITY: 'City Name', STATE: 'State Name', TEAM_FOLLOWERS: 'Team',
    PLAYER_FOLLOWERS: 'Player', SPORT_FOLLOWERS: 'Sport',
  };

  const historyColumns: Column<NotificationHistoryEntry>[] = [
    { key: 'title', header: 'Title' },
    { key: 'target', header: 'Target' },
    { key: 'sentAt', header: 'Sent At', render: (r) => new Date(r.sentAt).toLocaleString() },
    { key: 'recipientCount', header: 'Recipients', render: (r) => r.recipientCount.toLocaleString() },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Push Notifications</h1>
        <p className="mt-1 text-sm text-muted">Send push notifications to app users</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Target Type</Label>
            <Select value={targetType} onValueChange={(v) => setValue('targetType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TARGETS.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
              </SelectContent>
            </Select>
            {errors.targetType && <p className="text-xs text-red">{errors.targetType.message}</p>}
          </div>
          {needsTargetId && (
            <div className="space-y-1.5">
              <Label>{targetLabel[targetType] ?? 'Target ID'}</Label>
              <Input {...register('targetId')} placeholder="Enter target identifier" />
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Template (optional)</Label>
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger><SelectValue placeholder="Select a template..." /></SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input {...register('title')} placeholder="Notification title" />
          {errors.title && <p className="text-xs text-red">{errors.title.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Body</Label>
          <textarea {...register('body')} placeholder="Notification body..."
            className="flex min-h-[100px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold" />
          {errors.body && <p className="text-xs text-red">{errors.body.message}</p>}
        </div>
        <Button type="submit"><Send size={16} /> Send Notification</Button>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send</DialogTitle>
            <DialogDescription>Are you sure you want to send this notification?</DialogDescription>
          </DialogHeader>
          {pendingData && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted">Target:</span> {pendingData.targetType}</p>
              <p><span className="text-muted">Title:</span> {pendingData.title}</p>
              <p><span className="text-muted">Body:</span> {pendingData.body}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmSend} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Confirm Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Notification History</h2>
        <DataTable columns={historyColumns} data={(historyData?.data ?? []) as unknown as Record<string, unknown>[]}
          isLoading={historyLoading} emptyMessage="No notifications sent yet" />
      </div>
    </div>
  );
}
