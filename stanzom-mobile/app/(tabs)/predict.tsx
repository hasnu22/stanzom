import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { SPORTS, DEFAULT_SPORT } from '../../constants/sports';
import { getEvents } from '../../services/eventService';
import {
  getQuestions,
  answerQuestion,
  lockPrediction,
  getPredictionCard,
} from '../../services/predictionService';
import BebasText from '../../components/ui/BebasText';
import QuestionCard from '../../components/prediction/QuestionCard';
import PredictionResultCard from '../../components/prediction/PredictionResultCard';

const ALL_SPORTS = [{ slug: 'all', name: 'All', icon: '\u{1F3C6}', color: Colors.gold }, ...SPORTS];

export default function PredictScreen() {
  const queryClient = useQueryClient();
  const [selectedSport, setSelectedSport] = useState<string>(DEFAULT_SPORT);

  const sportSlugParam = selectedSport === 'all' ? undefined : selectedSport;

  // Fetch upcoming and live events to find current prediction event
  const eventsQuery = useQuery({
    queryKey: ['events', 'predict', sportSlugParam],
    queryFn: async () => {
      const [liveEvents, upcomingEvents] = await Promise.all([
        getEvents({ status: 'LIVE', sportSlug: sportSlugParam }),
        getEvents({ status: 'UPCOMING', sportSlug: sportSlugParam }),
      ]);
      return { liveEvents: liveEvents as any[], upcomingEvents: upcomingEvents as any[] };
    },
  });

  const currentEvent =
    (eventsQuery.data?.liveEvents ?? [])[0] ??
    (eventsQuery.data?.upcomingEvents ?? [])[0] ??
    null;

  // Fetch completed events for showing results
  const completedQuery = useQuery({
    queryKey: ['events', 'COMPLETED', sportSlugParam, 'predict-results'],
    queryFn: async () => {
      const data = await getEvents({ status: 'COMPLETED', sportSlug: sportSlugParam });
      return data as any[];
    },
  });

  const lastCompletedEvent = (completedQuery.data ?? [])[0] ?? null;

  // Fetch questions for the current event
  const questionsQuery = useQuery({
    queryKey: ['predictions', 'questions', currentEvent?.id],
    queryFn: async () => {
      const data = await getQuestions(currentEvent!.id);
      return data as any;
    },
    enabled: !!currentEvent?.id,
  });

  // Fetch prediction card (user answers) for current event
  const predictionCardQuery = useQuery({
    queryKey: ['predictions', 'card', currentEvent?.id],
    queryFn: async () => {
      const data = await getPredictionCard(currentEvent!.id);
      return data as any;
    },
    enabled: !!currentEvent?.id,
  });

  // Fetch prediction results for last completed event
  const resultCardQuery = useQuery({
    queryKey: ['predictions', 'card', lastCompletedEvent?.id],
    queryFn: async () => {
      const data = await getPredictionCard(lastCompletedEvent!.id);
      return data as any;
    },
    enabled: !!lastCompletedEvent?.id && lastCompletedEvent?.id !== currentEvent?.id,
  });

  // Answer mutation
  const answerMutation = useMutation({
    mutationFn: async ({ questionId, optionId }: { questionId: string; optionId: string }) => {
      await answerQuestion(questionId, optionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'card', currentEvent?.id] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit answer. Please try again.');
    },
  });

  // Lock mutation
  const lockMutation = useMutation({
    mutationFn: async (questionId: string) => {
      await lockPrediction(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'card', currentEvent?.id] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to lock prediction.');
    },
  });

  // Lock all predictions
  const lockAllMutation = useMutation({
    mutationFn: async () => {
      const questions = questionsQuery.data ?? [];
      const userPredictions = predictionCardQuery.data?.userPredictions ?? [];
      const answeredIds = userPredictions
        .filter((p: any) => p.selectedOptionId && !p.isLocked)
        .map((p: any) => p.questionId);

      const questionIdsToLock = questions
        .filter((q: any) => answeredIds.includes(q.id))
        .map((q: any) => q.id);

      await Promise.all(questionIdsToLock.map((id: string) => lockPrediction(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'card', currentEvent?.id] });
      Alert.alert('Locked!', 'All your predictions have been locked in.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to lock some predictions.');
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      eventsQuery.refetch(),
      questionsQuery.refetch(),
      predictionCardQuery.refetch(),
      completedQuery.refetch(),
      resultCardQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [eventsQuery, questionsQuery, predictionCardQuery, completedQuery, resultCardQuery]);

  const handleAnswer = (questionId: string, optionId: string) => {
    answerMutation.mutate({ questionId, optionId });
  };

  const handleLock = (questionId: string) => {
    lockMutation.mutate(questionId);
  };

  const questions = questionsQuery.data ?? [];
  const userPredictions = predictionCardQuery.data?.userPredictions ?? [];
  const todayPoints = predictionCardQuery.data?.earnedPoints ?? 0;

  const getUserPrediction = (questionId: string) => {
    return userPredictions.find((p: any) => p.questionId === questionId);
  };

  const hasAnsweredQuestions = userPredictions.some(
    (p: any) => p.selectedOptionId && !p.isLocked,
  );

  // Loading
  if (eventsQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading predictions...</Text>
      </View>
    );
  }

  // Error
  if (eventsQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load
        </BebasText>
        <Text style={styles.errorSubtext}>Pull down to try again</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BebasText size={28} color={Colors.text}>
          Predictions
        </BebasText>
      </View>

      {/* Sport Selector Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
      >
        {ALL_SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport.slug}
            style={[styles.pill, selectedSport === sport.slug && styles.pillActive]}
            onPress={() => setSelectedSport(sport.slug)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillIcon}>{sport.icon}</Text>
            <Text style={[styles.pillText, selectedSport === sport.slug && styles.pillTextActive]}>
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Points Summary */}
        <View style={styles.pointsSummary}>
          <Text style={styles.pointsLabel}>Today's Prediction Points</Text>
          <BebasText size={36} color={Colors.gold}>
            {todayPoints}
          </BebasText>
        </View>

        {/* Current Event Info */}
        {currentEvent && (
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {currentEvent.title}
            </Text>
            {currentEvent.status === 'LIVE' && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
        )}

        {/* Questions */}
        {!currentEvent ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\uD83D\uDD2E'}</Text>
            <BebasText size={20} color={Colors.text}>
              No Active Predictions
            </BebasText>
            <Text style={styles.emptySubtext}>
              Predictions will be available before the next match!
            </Text>
          </View>
        ) : questionsQuery.isLoading ? (
          <ActivityIndicator color={Colors.gold} style={{ marginTop: 24 }} />
        ) : questions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\uD83D\uDD2E'}</Text>
            <BebasText size={20} color={Colors.text}>
              No Questions Yet
            </BebasText>
            <Text style={styles.emptySubtext}>
              Prediction questions will appear here before the match starts.
            </Text>
          </View>
        ) : (
          <>
            {questions.map((q: any) => (
              <QuestionCard
                key={q.id}
                question={q}
                userPrediction={getUserPrediction(q.id)}
                onAnswer={handleAnswer}
                onLock={handleLock}
              />
            ))}

            {/* Lock All Button */}
            {hasAnsweredQuestions && (
              <TouchableOpacity
                style={[
                  styles.lockAllButton,
                  lockAllMutation.isPending && styles.lockAllButtonDisabled,
                ]}
                onPress={() => lockAllMutation.mutate()}
                disabled={lockAllMutation.isPending}
                activeOpacity={0.7}
              >
                {lockAllMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.bg} />
                ) : (
                  <BebasText size={18} color={Colors.bg}>
                    {'\uD83D\uDD12'} Lock Predictions
                  </BebasText>
                )}
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Previous Event Results */}
        {resultCardQuery.data && lastCompletedEvent && (
          <View style={styles.resultsSection}>
            <BebasText size={20} color={Colors.text}>
              Previous Match Results
            </BebasText>
            <Text style={styles.resultEventTitle} numberOfLines={1}>
              {lastCompletedEvent.title}
            </Text>
            <View style={{ marginTop: 12 }}>
              <PredictionResultCard card={resultCardQuery.data} />
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorSubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  pillsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  pillActive: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderColor: Colors.gold,
  },
  pillIcon: {
    fontSize: 16,
  },
  pillText: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.gold,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  pointsSummary: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gold,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsLabel: {
    color: Colors.muted,
    fontSize: 13,
    marginBottom: 4,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  eventTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,71,87,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.red,
  },
  liveText: {
    color: Colors.red,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptySubtext: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  lockAllButton: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  lockAllButtonDisabled: {
    opacity: 0.5,
  },
  resultsSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  resultEventTitle: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
