import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import api from '../../services/api';
import { getEvents } from '../../services/eventService';
import BebasText from '../../components/ui/BebasText';
import ShareStrip from '../../components/ui/ShareStrip';

export default function SentimentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const eventsQuery = useQuery({
    queryKey: ['events', 'sentiment'],
    queryFn: async () => {
      const liveRes = await getEvents({ status: 'LIVE' });
      const upcomingRes = await getEvents({ status: 'UPCOMING' });
      return [
        ...(liveRes.data as any[]),
        ...(upcomingRes.data as any[]).slice(0, 5),
      ];
    },
  });

  const sentimentQuery = useQuery({
    queryKey: ['sentiment', selectedEventId],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/events/${selectedEventId}/sentiment`,
      );
      return data as any;
    },
    enabled: !!selectedEventId,
  });

  const voteMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const { data } = await api.post(
        `/api/events/${selectedEventId}/sentiment/vote`,
        { teamId },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sentiment', selectedEventId],
      });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([eventsQuery.refetch(), sentimentQuery.refetch()]);
    setRefreshing(false);
  }, [eventsQuery, sentimentQuery]);

  const events = eventsQuery.data ?? [];
  const sentiment = sentimentQuery.data;
  const hasVoted = sentiment?.userVote != null;
  const totalVotes = (sentiment?.teamAVotes ?? 0) + (sentiment?.teamBVotes ?? 0);
  const teamAPercent =
    totalVotes > 0
      ? Math.round(((sentiment?.teamAVotes ?? 0) / totalVotes) * 100)
      : 50;
  const teamBPercent = 100 - teamAPercent;

  // Auto-select first event
  if (events.length > 0 && !selectedEventId) {
    setSelectedEventId(events[0].id);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.text}>
          SENTIMENT MAP
        </BebasText>
        <View style={styles.backBtn} />
      </View>

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
        {/* Event Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Event</Text>
          {eventsQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
          ) : events.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{'\uD83D\uDCC5'}</Text>
              <Text style={styles.emptyText}>No live or upcoming events</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventPills}
            >
              {events.map((event: any) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.eventPill,
                    selectedEventId === event.id && styles.eventPillActive,
                  ]}
                  onPress={() => setSelectedEventId(event.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.eventPillText,
                      selectedEventId === event.id && styles.eventPillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                  {event.status === 'LIVE' && (
                    <View style={styles.liveDot} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Voting Section */}
        {selectedEventId && (
          <>
            <View style={styles.section}>
              <BebasText size={22} color={Colors.gold}>
                Who will win?
              </BebasText>

              {sentimentQuery.isLoading ? (
                <ActivityIndicator
                  color={Colors.gold}
                  style={{ marginTop: 20 }}
                />
              ) : sentimentQuery.isError ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>
                    Could not load sentiment data
                  </Text>
                </View>
              ) : (
                <>
                  {/* Vote Buttons */}
                  <View style={styles.voteRow}>
                    <TouchableOpacity
                      style={[
                        styles.voteBtn,
                        styles.voteBtnA,
                        hasVoted &&
                          sentiment?.userVote === sentiment?.teamAId &&
                          styles.voteBtnSelected,
                        hasVoted &&
                          sentiment?.userVote !== sentiment?.teamAId &&
                          styles.voteBtnDimmed,
                      ]}
                      onPress={() =>
                        !hasVoted &&
                        sentiment?.teamAId &&
                        voteMutation.mutate(sentiment.teamAId)
                      }
                      disabled={hasVoted || voteMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <BebasText size={20} color={Colors.text}>
                        {sentiment?.teamAName ?? 'Team A'}
                      </BebasText>
                    </TouchableOpacity>

                    <Text style={styles.vsText}>VS</Text>

                    <TouchableOpacity
                      style={[
                        styles.voteBtn,
                        styles.voteBtnB,
                        hasVoted &&
                          sentiment?.userVote === sentiment?.teamBId &&
                          styles.voteBtnSelected,
                        hasVoted &&
                          sentiment?.userVote !== sentiment?.teamBId &&
                          styles.voteBtnDimmed,
                      ]}
                      onPress={() =>
                        !hasVoted &&
                        sentiment?.teamBId &&
                        voteMutation.mutate(sentiment.teamBId)
                      }
                      disabled={hasVoted || voteMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <BebasText size={20} color={Colors.text}>
                        {sentiment?.teamBName ?? 'Team B'}
                      </BebasText>
                    </TouchableOpacity>
                  </View>

                  {voteMutation.isPending && (
                    <ActivityIndicator
                      color={Colors.gold}
                      style={{ marginTop: 12 }}
                    />
                  )}

                  {hasVoted && (
                    <View style={styles.votedNotice}>
                      <Text style={styles.votedText}>
                        {'\u2705'} You voted for{' '}
                        {sentiment?.userVote === sentiment?.teamAId
                          ? sentiment?.teamAName
                          : sentiment?.teamBName}
                      </Text>
                    </View>
                  )}

                  {/* Results Bar Chart */}
                  {totalVotes > 0 && (
                    <View style={styles.resultsSection}>
                      <Text style={styles.resultLabel}>
                        {totalVotes.toLocaleString()} total votes
                      </Text>

                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.barA,
                            { flex: teamAPercent },
                          ]}
                        >
                          <Text style={styles.barText}>
                            {teamAPercent}%
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.barB,
                            { flex: teamBPercent },
                          ]}
                        >
                          <Text style={styles.barText}>
                            {teamBPercent}%
                          </Text>
                        </View>
                      </View>

                      <View style={styles.barLabels}>
                        <Text style={styles.barLabelA}>
                          {sentiment?.teamAName}
                        </Text>
                        <Text style={styles.barLabelB}>
                          {sentiment?.teamBName}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Geographic Breakdown */}
                  {(sentiment?.geoBreakdown ?? []).length > 0 && (
                    <View style={styles.geoSection}>
                      <BebasText size={18} color={Colors.text}>
                        Geographic Breakdown
                      </BebasText>
                      {sentiment.geoBreakdown.map(
                        (geo: any, idx: number) => (
                          <View key={geo.city ?? idx} style={styles.geoRow}>
                            <Text style={styles.geoLocation}>
                              {geo.city ?? geo.state ?? 'Unknown'}
                            </Text>
                            <View style={styles.geoVotes}>
                              <Text style={styles.geoTeamA}>
                                {geo.teamAVotes ?? 0}
                              </Text>
                              <Text style={styles.geoDivider}>|</Text>
                              <Text style={styles.geoTeamB}>
                                {geo.teamBVotes ?? 0}
                              </Text>
                            </View>
                          </View>
                        ),
                      )}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Share */}
            <View style={styles.section}>
              <ShareStrip
                contentType="sentiment"
                data={{
                  id: selectedEventId,
                  teamA: sentiment?.teamAName,
                  teamB: sentiment?.teamBName,
                }}
              />
            </View>
          </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventPills: {
    gap: 8,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
    maxWidth: 200,
  },
  eventPillActive: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderColor: Colors.gold,
  },
  eventPillText: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  eventPillTextActive: {
    color: Colors.gold,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
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
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  voteBtn: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  voteBtnA: {
    borderColor: Colors.blue,
    backgroundColor: 'rgba(74,158,255,0.1)',
  },
  voteBtnB: {
    borderColor: Colors.red,
    backgroundColor: 'rgba(255,71,87,0.1)',
  },
  voteBtnSelected: {
    borderWidth: 3,
  },
  voteBtnDimmed: {
    opacity: 0.4,
  },
  vsText: {
    color: Colors.muted,
    fontSize: 16,
    fontWeight: '700',
  },
  votedNotice: {
    backgroundColor: 'rgba(0,230,118,0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  votedText: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: 20,
  },
  resultLabel: {
    color: Colors.muted,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barA: {
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barB: {
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  barLabelA: {
    color: Colors.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  barLabelB: {
    color: Colors.red,
    fontSize: 13,
    fontWeight: '600',
  },
  geoSection: {
    marginTop: 24,
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  geoLocation: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  geoVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  geoTeamA: {
    color: Colors.blue,
    fontSize: 14,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
  },
  geoDivider: {
    color: Colors.muted,
    fontSize: 14,
  },
  geoTeamB: {
    color: Colors.red,
    fontSize: 14,
    fontWeight: '700',
    width: 40,
  },
});
