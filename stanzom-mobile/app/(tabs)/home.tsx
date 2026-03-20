import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { SPORTS, DEFAULT_SPORT } from '../../constants/sports';
import { getEvents } from '../../services/eventService';
import { getQuestions } from '../../services/predictionService';
import { getLeaderboard } from '../../services/predictionService';
import { useNotificationStore } from '../../store/notificationStore';
import BebasText from '../../components/ui/BebasText';
import LiveScoreCard from '../../components/event/LiveScoreCard';
import QuestionCard from '../../components/prediction/QuestionCard';

const ALL_SPORTS = [{ slug: 'all', name: 'All', icon: '\u{1F3C6}', color: Colors.gold }, ...SPORTS];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<string>(DEFAULT_SPORT);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const sportSlugParam = selectedSport === 'all' ? undefined : selectedSport;

  const liveEventsQuery = useQuery({
    queryKey: ['events', 'LIVE', sportSlugParam],
    queryFn: async () => {
      const data = await getEvents({ status: 'LIVE', sportSlug: sportSlugParam });
      return data as any[];
    },
  });

  const upcomingEventsQuery = useQuery({
    queryKey: ['events', 'UPCOMING', sportSlugParam],
    queryFn: async () => {
      const data = await getEvents({ status: 'UPCOMING', sportSlug: sportSlugParam });
      return data as any[];
    },
  });

  const todayMatches = (upcomingEventsQuery.data ?? []).filter((e: any) => {
    const eventDate = new Date(e.eventDate);
    const today = new Date();
    return (
      eventDate.getFullYear() === today.getFullYear() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getDate() === today.getDate()
    );
  });

  const nextUpcomingEvent = (upcomingEventsQuery.data ?? [])[0];

  const predictionsQuery = useQuery({
    queryKey: ['predictions', 'quick', nextUpcomingEvent?.id],
    queryFn: async () => {
      if (!nextUpcomingEvent?.id) return [];
      const data = await getQuestions(nextUpcomingEvent.id);
      return (data as any[]).slice(0, 3);
    },
    enabled: !!nextUpcomingEvent?.id,
  });

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', 'GLOBAL', sportSlugParam],
    queryFn: async () => {
      const data = await getLeaderboard({ scope: 'GLOBAL', sportSlug: sportSlugParam });
      return (data as any[]).slice(0, 5);
    },
  });

  const isLoading =
    liveEventsQuery.isLoading ||
    upcomingEventsQuery.isLoading;

  const isError =
    liveEventsQuery.isError ||
    upcomingEventsQuery.isError;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      liveEventsQuery.refetch(),
      upcomingEventsQuery.refetch(),
      predictionsQuery.refetch(),
      leaderboardQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [liveEventsQuery, upcomingEventsQuery, predictionsQuery, leaderboardQuery]);

  const handleAnswer = (_questionId: string, _optionId: string) => {
    // Navigate to full predictions screen for interaction
    router.push('/(tabs)/predict');
  };

  const handleLock = (_questionId: string) => {
    router.push('/(tabs)/predict');
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Something went wrong
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
        <TouchableOpacity style={styles.hamburger} activeOpacity={0.6}>
          <Text style={styles.hamburgerText}>{'\u2261'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.gold}>
          STANZOM
        </BebasText>
        <TouchableOpacity
          style={styles.bellContainer}
          onPress={() => { /* TODO: add /notifications route */ }}
          activeOpacity={0.6}
        >
          <Text style={styles.bellIcon}>{'\uD83D\uDD14'}</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
            style={[
              styles.pill,
              selectedSport === sport.slug && styles.pillActive,
            ]}
            onPress={() => setSelectedSport(sport.slug)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillIcon}>{sport.icon}</Text>
            <Text
              style={[
                styles.pillText,
                selectedSport === sport.slug && styles.pillTextActive,
              ]}
            >
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
        {/* SECTION 1: Live Now */}
        {(liveEventsQuery.data ?? []).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveDot} />
              <BebasText size={22} color={Colors.green}>
                Live Now
              </BebasText>
            </View>
            <FlatList
              horizontal
              data={liveEventsQuery.data}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }) => (
                <View style={styles.liveCardWrapper}>
                  <LiveScoreCard event={item} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              scrollEnabled
            />
          </View>
        )}

        {/* SECTION 2: Today's Matches */}
        <View style={styles.section}>
          <BebasText size={22} color={Colors.text}>
            Today's Matches
          </BebasText>
          {todayMatches.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{'\uD83D\uDCC5'}</Text>
              <Text style={styles.emptyText}>No matches scheduled for today</Text>
            </View>
          ) : (
            todayMatches.map((event: any) => (
              <View key={event.id} style={styles.verticalCardWrapper}>
                <LiveScoreCard event={event} />
              </View>
            ))
          )}
        </View>

        {/* SECTION 3: Quick Predictions */}
        {(predictionsQuery.data ?? []).length > 0 && (
          <View style={styles.section}>
            <BebasText size={22} color={Colors.text}>
              {'\uD83D\uDD2E'} Quick Predictions
            </BebasText>
            {predictionsQuery.data!.map((q: any) => (
              <QuestionCard
                key={q.id}
                question={q}
                onAnswer={handleAnswer}
                onLock={handleLock}
              />
            ))}
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/(tabs)/predict')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See All Predictions {'\u2192'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION 4: Top Fans */}
        <View style={styles.section}>
          <BebasText size={22} color={Colors.text}>
            {'\uD83C\uDFC6'} Top Fans
          </BebasText>
          {leaderboardQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
          ) : (leaderboardQuery.data ?? []).length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{'\uD83C\uDFC6'}</Text>
              <Text style={styles.emptyText}>Leaderboard is empty. Start predicting!</Text>
            </View>
          ) : (
            <View style={styles.leaderboardCard}>
              {leaderboardQuery.data!.map((entry: any, index: number) => (
                <View key={entry.id ?? index} style={styles.leaderRow}>
                  <View style={styles.rankCircle}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName} numberOfLines={1}>
                      {entry.displayName ?? entry.userName ?? 'Fan'}
                    </Text>
                    <Text style={styles.leaderAccuracy}>
                      {entry.accuracy != null ? `${Math.round(entry.accuracy)}% accuracy` : ''}
                    </Text>
                  </View>
                  <BebasText size={20} color={Colors.gold}>
                    {entry.totalPoints ?? entry.points ?? 0}
                  </BebasText>
                </View>
              ))}
            </View>
          )}
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  hamburger: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  bellContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.red,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
    paddingTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  horizontalList: {
    gap: 12,
    paddingVertical: 4,
  },
  liveCardWrapper: {
    width: 280,
  },
  verticalCardWrapper: {
    marginTop: 10,
  },
  emptySection: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  seeAllButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  seeAllText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginTop: 10,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245,166,35,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  leaderAccuracy: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
