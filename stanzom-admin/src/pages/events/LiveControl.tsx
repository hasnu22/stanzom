import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Trophy,
  Clock,
  Flag,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { eventService } from '@/services/eventService';
import { predictionService } from '@/services/predictionService';
import { notificationService } from '@/services/notificationService';
import type { Event } from '@/types';

/* ------------------------------------------------------------------ */
/*  Schemas                                                            */
/* ------------------------------------------------------------------ */

const scoreSchema = z.object({
  score_home: z.coerce.number().min(0),
  score_away: z.coerce.number().min(0),
  current_period: z.string().min(1, 'Period is required'),
  status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED']),
});

type ScoreFormValues = z.infer<typeof scoreSchema>;

const questionSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  question_type: z.string().min(1, 'Question type is required'),
  points: z.coerce.number().int().min(1, 'Points must be at least 1'),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1, 'Option text is required'),
      })
    )
    .min(2, 'At least 2 options are required'),
  lock_time: z.string().min(1, 'Lock time is required'),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

/* ------------------------------------------------------------------ */
/*  Resolve Dialog                                                     */
/* ------------------------------------------------------------------ */

function ResolveDialog({
  question,
  onClose,
  onResolve,
  isResolving,
}: {
  question: any;
  onClose: () => void;
  onResolve: (questionId: string, correctOptionId: string) => void;
  isResolving: boolean;
}) {
  const [selected, setSelected] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">Resolve Question</h3>
        <p className="text-sm text-(--color-muted)">{question.question_text}</p>

        <div className="space-y-2">
          <Label>Select Correct Answer</Label>
          {(question.options ?? []).map((opt: any) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                selected === opt.id
                  ? 'border-(--color-gold) bg-(--color-gold)/10'
                  : 'border-(--color-border) hover:bg-(--color-bg)/50'
              }`}
            >
              <input
                type="radio"
                name="correct_option"
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
                className="accent-(--color-gold)"
              />
              <span className="text-sm">{opt.text}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isResolving}>
            Cancel
          </Button>
          <Button
            disabled={!selected || isResolving}
            onClick={() => onResolve(question.id, selected)}
          >
            <CheckCircle2 size={16} />
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Notification Buttons                                         */
/* ------------------------------------------------------------------ */

const QUICK_NOTIFICATIONS = [
  { label: 'Wicket Alert', icon: AlertTriangle, type: 'WICKET' },
  { label: 'Six!', icon: Zap, type: 'SIX' },
  { label: 'Goal!', icon: Trophy, type: 'GOAL' },
  { label: 'Half-time', icon: Clock, type: 'HALF_TIME' },
  { label: 'Match End', icon: Flag, type: 'MATCH_END' },
] as const;

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg ${
        type === 'success'
          ? 'bg-(--color-green)/15 border border-(--color-green)/30 text-(--color-green)'
          : 'bg-(--color-red)/15 border border-(--color-red)/30 text-(--color-red)'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
        x
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LiveControl() {
  const { id: paramEventId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [selectedEventId, setSelectedEventId] = useState(paramEventId ?? '');
  const [resolveQuestion, setResolveQuestion] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  /* Fetch live events for selector */
  const { data: liveEvents } = useQuery({
    queryKey: ['events', { status: 'LIVE' }],
    queryFn: () => eventService.getEvents({ status: 'LIVE' }),
  });

  /* Fetch selected event details */
  const { data: event } = useQuery({
    queryKey: ['event', selectedEventId],
    queryFn: () => eventService.getEvent(selectedEventId),
    enabled: Boolean(selectedEventId),
  });

  /* Fetch active questions */
  const { data: activeQuestions } = useQuery({
    queryKey: ['questions', selectedEventId],
    queryFn: () => predictionService.getActiveQuestions(selectedEventId),
    enabled: Boolean(selectedEventId),
    refetchInterval: 10000,
  });

  /* ------ Score Form ------ */

  const scoreForm = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    values: {
      score_home: event?.score_home ?? 0,
      score_away: event?.score_away ?? 0,
      current_period: event?.current_period ?? '',
      status: event?.status ?? 'LIVE',
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: (data: ScoreFormValues) =>
      eventService.updateScore(selectedEventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', selectedEventId] });
      showToast('Score updated & broadcast sent');
    },
    onError: (err: Error) => showToast(err.message ?? 'Failed to update score', 'error'),
  });

  /* ------ Question Form ------ */

  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: '',
      question_type: 'MULTIPLE_CHOICE',
      points: 10,
      options: [
        { id: 'opt_1', text: '' },
        { id: 'opt_2', text: '' },
      ],
      lock_time: '',
    },
  });

  const { fields: optionFields, append: addOption, remove: removeOption } = useFieldArray({
    control: questionForm.control,
    name: 'options',
  });

  const pushQuestionMutation = useMutation({
    mutationFn: (data: QuestionFormValues) =>
      predictionService.pushQuestion(selectedEventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', selectedEventId] });
      questionForm.reset();
      showToast('Prediction question pushed');
    },
    onError: (err: Error) => showToast(err.message ?? 'Failed to push question', 'error'),
  });

  /* ------ Resolve ------ */

  const resolveMutation = useMutation({
    mutationFn: ({
      questionId,
      correctOptionId,
    }: {
      questionId: string;
      correctOptionId: string;
    }) => predictionService.resolveQuestion(questionId, correctOptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', selectedEventId] });
      setResolveQuestion(null);
      showToast('Question resolved, points distributed');
    },
    onError: (err: Error) => showToast(err.message ?? 'Failed to resolve question', 'error'),
  });

  /* ------ Quick Push Notification ------ */

  const notifyMutation = useMutation({
    mutationFn: (type: string) =>
      notificationService.sendQuickPush(selectedEventId, type),
    onSuccess: () => showToast('Notification sent'),
    onError: (err: Error) =>
      showToast(err.message ?? 'Failed to send notification', 'error'),
  });

  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Live Control</h1>

      {/* Event Selector */}
      <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-4">
        <Label htmlFor="event_select" className="mb-2 block">
          Select Live Event
        </Label>
        <select
          id="event_select"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="h-10 w-full max-w-md rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
        >
          <option value="">Choose event...</option>
          {(liveEvents ?? []).map((ev: Event) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {selectedEventId && event && (
        <>
          {/* ---- Score Panel ---- */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-(--color-green) animate-pulse" />
              <h2 className="text-lg font-semibold">Current Score</h2>
            </div>

            <form
              onSubmit={scoreForm.handleSubmit((d) => updateScoreMutation.mutate(d))}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Home Score</Label>
                  <Input
                    type="number"
                    min={0}
                    {...scoreForm.register('score_home')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Away Score</Label>
                  <Input
                    type="number"
                    min={0}
                    {...scoreForm.register('score_away')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Input
                    placeholder="1st Half"
                    {...scoreForm.register('current_period')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    {...scoreForm.register('status')}
                    className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={updateScoreMutation.isPending}>
                <Send size={16} />
                Update Score
              </Button>
            </form>
          </div>

          {/* ---- Push Prediction Question ---- */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-6 space-y-5">
            <h2 className="text-lg font-semibold">Push Prediction Question</h2>

            <form
              onSubmit={questionForm.handleSubmit((d) =>
                pushQuestionMutation.mutate(d)
              )}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Question Text</Label>
                  <Input
                    placeholder="Who will score the next goal?"
                    {...questionForm.register('question_text')}
                  />
                  {questionForm.formState.errors.question_text && (
                    <p className="text-xs text-(--color-red)">
                      {questionForm.formState.errors.question_text.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <select
                    {...questionForm.register('question_type')}
                    className="flex h-10 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-gold)"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="YES_NO">Yes / No</option>
                    <option value="NUMERIC">Numeric</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min={1}
                    {...questionForm.register('points')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lock Time</Label>
                  <Input
                    type="datetime-local"
                    {...questionForm.register('lock_time')}
                  />
                  {questionForm.formState.errors.lock_time && (
                    <p className="text-xs text-(--color-red)">
                      {questionForm.formState.errors.lock_time.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addOption({ id: `opt_${optionFields.length + 1}`, text: '' })
                    }
                  >
                    <Plus size={14} />
                    Add Option
                  </Button>
                </div>

                {optionFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-3">
                    <Input
                      placeholder={`Option ${idx + 1}`}
                      {...questionForm.register(`options.${idx}.text`)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="ID"
                      {...questionForm.register(`options.${idx}.id`)}
                      className="w-24"
                    />
                    {optionFields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-(--color-red)"
                        onClick={() => removeOption(idx)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}

                {questionForm.formState.errors.options && (
                  <p className="text-xs text-(--color-red)">
                    {questionForm.formState.errors.options.message ??
                      questionForm.formState.errors.options.root?.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={pushQuestionMutation.isPending}>
                <Send size={16} />
                Push Question
              </Button>
            </form>
          </div>

          {/* ---- Active Questions ---- */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-6 space-y-4">
            <h2 className="text-lg font-semibold">Active Questions</h2>

            {(!activeQuestions || activeQuestions.length === 0) && (
              <p className="text-sm text-(--color-muted)">
                No active questions for this event.
              </p>
            )}

            {(activeQuestions ?? []).map((q: any) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-lg border border-(--color-border) p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{q.question_text}</p>
                  <p className="text-xs text-(--color-muted)">
                    {q.question_type} &middot; {q.points} pts &middot; Locks{' '}
                    {new Date(q.lock_time).toLocaleTimeString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(q.options ?? []).map((opt: any) => (
                      <span
                        key={opt.id}
                        className="rounded-full bg-(--color-bg) px-2.5 py-0.5 text-xs text-(--color-muted)"
                      >
                        {opt.text}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResolveQuestion(q)}
                >
                  <CheckCircle2 size={14} />
                  Resolve
                </Button>
              </div>
            ))}
          </div>

          {/* ---- Quick Push Notifications ---- */}
          <div className="rounded-xl bg-(--color-card) border border-(--color-border) p-6 space-y-4">
            <h2 className="text-lg font-semibold">Quick Push Notifications</h2>
            <div className="flex flex-wrap gap-3">
              {QUICK_NOTIFICATIONS.map((n) => {
                const Icon = n.icon;
                return (
                  <Button
                    key={n.type}
                    variant="outline"
                    onClick={() => notifyMutation.mutate(n.type)}
                    disabled={notifyMutation.isPending}
                  >
                    <Icon size={16} />
                    {n.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Resolve Dialog */}
      {resolveQuestion && (
        <ResolveDialog
          question={resolveQuestion}
          onClose={() => setResolveQuestion(null)}
          isResolving={resolveMutation.isPending}
          onResolve={(questionId, correctOptionId) =>
            resolveMutation.mutate({ questionId, correctOptionId })
          }
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
