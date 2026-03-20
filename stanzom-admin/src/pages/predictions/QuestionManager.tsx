import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { predictionService } from '@/services/predictionService';
import { eventService } from '@/services/eventService';
import { sportService } from '@/services/sportService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Trash2, CheckCircle, Clock, Target, AlertCircle } from 'lucide-react';

const questionSchema = z.object({
  questionText: z.string().min(5, 'Question must be at least 5 characters'),
  questionType: z.string().min(1, 'Select a question type'),
  points: z.coerce.number().min(1).max(100),
  lockTime: z.string().min(1, 'Lock time is required'),
  options: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1, 'Option text is required'),
  })).min(2, 'At least 2 options required'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

const QUESTION_TYPES = [
  'EVENT_WINNER', 'TOSS', 'TOP_SCORER', 'FIRST_GOAL',
  'MAN_OF_THE_MATCH', 'TOTAL_RUNS', 'TOTAL_GOALS',
  'FIRST_WICKET', 'FIRST_SIX', 'HALF_TIME_SCORE',
];

export default function QuestionManager() {
  const queryClient = useQueryClient();
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [resolveDialog, setResolveDialog] = useState<{ open: boolean; questionId: string; options: { id: string; text: string }[] }>({ open: false, questionId: '', options: [] });
  const [selectedCorrect, setSelectedCorrect] = useState('');

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: sportService.getSports,
  });

  const { data: events } = useQuery({
    queryKey: ['events', 'live-upcoming', selectedSport],
    queryFn: () => eventService.getEvents({ status: 'LIVE,UPCOMING', sportSlug: selectedSport }),
    enabled: true,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['predictions', 'questions', selectedEvent],
    queryFn: () => predictionService.getQuestions(selectedEvent),
    enabled: !!selectedEvent,
  });

  const { register, handleSubmit, control, reset, formState: { errors }, setValue } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: '',
      questionType: '',
      points: 10,
      lockTime: '',
      options: [{ id: 'A', text: '' }, { id: 'B', text: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  const pushMutation = useMutation({
    mutationFn: (data: QuestionFormData) =>
      predictionService.createQuestion({
        eventId: selectedEvent,
        questionText: data.questionText,
        questionType: data.questionType,
        points: data.points,
        lockTime: data.lockTime,
        options: data.options,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'questions', selectedEvent] });
      reset();
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ questionId, correctOptionId }: { questionId: string; correctOptionId: string }) =>
      predictionService.resolveQuestion(questionId, correctOptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'questions', selectedEvent] });
      setResolveDialog({ open: false, questionId: '', options: [] });
      setSelectedCorrect('');
    },
  });

  const onSubmit = (data: QuestionFormData) => pushMutation.mutate(data);

  const activeQuestions = questions?.data?.filter((q: any) => q.isActive && !q.correctOptionId) ?? [];
  const resolvedQuestions = questions?.data?.filter((q: any) => q.correctOptionId) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Prediction Questions</h1>
      </div>

      {/* Event Selector */}
      <Card>
        <CardContent className="flex gap-4 pt-6">
          <div className="w-48">
            <Label>Sport</Label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger><SelectValue placeholder="All Sports" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sports</SelectItem>
                {sports?.data?.map((s: any) => (
                  <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Event</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger><SelectValue placeholder="Select an event" /></SelectTrigger>
              <SelectContent>
                {events?.data?.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title} — <span className={e.status === 'LIVE' ? 'text-green' : 'text-gold'}>{e.status}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Push New Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus size={18} /> Push New Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input {...register('questionText')} placeholder="Who will win the match?" />
                  {errors.questionText && <p className="mt-1 text-xs text-red">{errors.questionText.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select onValueChange={(v) => setValue('questionType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.questionType && <p className="mt-1 text-xs text-red">{errors.questionType.message}</p>}
                  </div>
                  <div>
                    <Label>Points</Label>
                    <Input type="number" {...register('points')} />
                    {errors.points && <p className="mt-1 text-xs text-red">{errors.points.message}</p>}
                  </div>
                </div>

                <div>
                  <Label>Lock Time</Label>
                  <Input type="datetime-local" {...register('lockTime')} />
                  {errors.lockTime && <p className="mt-1 text-xs text-red">{errors.lockTime.message}</p>}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Options</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => append({ id: String.fromCharCode(65 + fields.length), text: '' })}
                      disabled={fields.length >= 6}
                    >
                      <Plus size={14} className="mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <span className="w-8 text-center text-sm font-bold text-gold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <Input {...register(`options.${idx}.text`)} placeholder={`Option ${String.fromCharCode(65 + idx)}`} className="flex-1" />
                        <input type="hidden" {...register(`options.${idx}.id`)} value={String.fromCharCode(65 + idx)} />
                        {fields.length > 2 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
                            <Trash2 size={14} className="text-red" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.options && <p className="mt-1 text-xs text-red">{errors.options.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={pushMutation.isPending}>
                  {pushMutation.isPending ? <Spinner size="sm" /> : <><Target size={16} className="mr-2" /> Push Question</>}
                </Button>
                {pushMutation.isSuccess && <p className="text-center text-sm text-green">Question pushed!</p>}
                {pushMutation.isError && <p className="text-center text-sm text-red">Failed to push question</p>}
              </form>
            </CardContent>
          </Card>

          {/* Active Questions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} className="text-gold" /> Active Questions ({activeQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : activeQuestions.length === 0 ? (
                  <p className="py-8 text-center text-muted">No active questions for this event</p>
                ) : (
                  <div className="space-y-3">
                    {activeQuestions.map((q: any) => (
                      <div key={q.id} className="rounded-lg border border-border bg-bg p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <p className="font-medium text-text">{q.questionText}</p>
                            <div className="mt-1 flex gap-2">
                              <Badge variant="info">{q.questionType?.replace(/_/g, ' ')}</Badge>
                              <Badge>{q.points} pts</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setResolveDialog({
                              open: true,
                              questionId: q.id,
                              options: q.options ?? [],
                            })}
                          >
                            <CheckCircle size={14} className="mr-1" /> Resolve
                          </Button>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {q.options?.map((opt: any) => (
                            <div key={opt.id} className="rounded bg-card px-3 py-1.5 text-sm text-muted">
                              <span className="font-bold text-gold">{opt.id}.</span> {opt.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resolved Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green" /> Resolved ({resolvedQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resolvedQuestions.length === 0 ? (
                  <p className="py-4 text-center text-muted">No resolved questions yet</p>
                ) : (
                  <div className="space-y-2">
                    {resolvedQuestions.map((q: any) => (
                      <div key={q.id} className="flex items-center justify-between rounded-lg border border-border bg-bg p-3">
                        <div>
                          <p className="text-sm text-text">{q.questionText}</p>
                          <p className="text-xs text-muted">
                            Correct: <span className="font-bold text-green">{q.correctOptionId}</span> · {q.points} pts
                          </p>
                        </div>
                        <Badge variant="success">Resolved</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!selectedEvent && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle size={48} className="mb-4 text-muted" />
            <p className="text-lg text-muted">Select an event to manage prediction questions</p>
          </CardContent>
        </Card>
      )}

      {/* Resolve Dialog */}
      <Dialog open={resolveDialog.open} onOpenChange={(open) => !open && setResolveDialog({ open: false, questionId: '', options: [] })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Question</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-sm text-muted">Select the correct answer. Points will be calculated and awarded to users who answered correctly.</p>
          <div className="space-y-2">
            {resolveDialog.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedCorrect(opt.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedCorrect === opt.id
                    ? 'border-green bg-green/10 text-green'
                    : 'border-border bg-bg text-text hover:border-muted'
                }`}
              >
                <span className="font-bold">{opt.id}.</span> {opt.text}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialog({ open: false, questionId: '', options: [] })}>
              Cancel
            </Button>
            <Button
              disabled={!selectedCorrect || resolveMutation.isPending}
              onClick={() => resolveMutation.mutate({ questionId: resolveDialog.questionId, correctOptionId: selectedCorrect })}
            >
              {resolveMutation.isPending ? <Spinner size="sm" /> : 'Confirm & Award Points'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
