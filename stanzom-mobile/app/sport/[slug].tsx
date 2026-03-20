import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import api from '../../services/api';
import { getEvents } from '../../services/eventService';
import BebasText from '../../components/ui/BebasText';
import LiveScoreCard from '../../components/event/LiveScoreCard';
import TeamCard from '../../components/team/TeamCard';
import PlayerCard from '../../components/player/PlayerCard';

interface SportInfo {
  slug: string;
  name: string;
  icon: string;
  description?: string;
}

interface Tournament {
  id: string;
  name: string;
  sportSlug: string;
  status: string;
  startDate: string;
  endDate: string;
  logoUrl?: string;
}

export default function SportScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const sportQuery = useQuery({
    queryKey: ['sport', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/sports/${slug}`);
      return data as SportInfo;
    },
    enabled: !!slug,
  });

  const liveEventsQuery = useQuery({
    queryKey: ['events', 'LIVE', slug],
    queryFn: async () => {
      const { data } = await getEvents({ status: 'LIVE', sportSlug: slug });
      return data as any[];
    },
    enabled: !!slug,
  });

  const upcomingEventsQuery = useQuery({
    queryKey: ['events', 'UPCOMING', slug],
    queryFn: async () => {
      const { data } = await getEvents({ status: 'UPCOMING', sportSlug: slug });
      return data as any[];
    },
    enabled: !!slug,
  });

  const tournamentsQuery = useQuery({
    queryKey: ['tournaments', slug],
    queryFn: async () => {
      const { data } = await api.get('/api/tournaments', {
        params: { sportSlug: slug },
      });
      return data as Tournament[];
    },
    enabled: !!slug,
  });

  const teamsQuery = useQuery({
    queryKey: ['teams', 'top', slug],
    queryFn: async () => {
      const { data } = await api.get('/api/teams', {
        params: { sportSlug: slug, sort: 'popular', limit: 10 },
      });
      return data as any[];
    },
    enabled: !!slug,
  });

  const playersQuery = useQuery({
    queryKey: ['players', 'top', slug],
    queryFn: async () => {
      const { data } = await api.get('/api/players', {
        params: { sportSlug: slug, sort: 'popular', limit: 10 },
      });
      return data as any[];
    },
    enabled: !!slug,
  });

  const isLoading =
    sportQuery.isLoading ||
    liveEventsQuery.isLoading ||
    upcomingEventsQuery.isLoading;

  const isError = sportQuery.isError;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      sportQuery.refetch(),
      liveEventsQuery.refetch(),
      upcomingEventsQuery.refetch(),
      tournamentsQuery.refetch(),
      teamsQuery.refetch(),
      playersQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [sportQuery, liveEventsQuery, upcomingEventsQuery, tournamentsQuery, teamsQuery, playersQuery]);

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
        <Text style={styles.errorSubtext}>Could not load sport details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sport = sportQuery.data;
  const liveEvents = liveEventsQuery.data ?? [];
  const upcomingEvents = upcomingEventsQuery.data ?? [];
  const tournaments = tournamentsQuery.data ?? [];
  const teams = teamsQuery.data ?? [];
  const players = playersQuery.data ?? [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.gold}>
          {sport?.name?.toUpperCase() ?? slug?.toUpperCase()}
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
        {/* Live Events */}
        {liveEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveDot} />
              <BebasText size={20} color={Colors.green}>
                Live Events
              </BebasText>
            </View>
            <FlatList
              horizontal
              data={liveEvents}
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

        {/* Upcoming Events */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Upcoming Events
          </BebasText>
          {upcomingEvents.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{'\uD83D\uDCC5'}</Text>
              <Text style={styles.emptyText}>No upcoming events</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={upcomingEvents.slice(0, 10)}
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
          )}
        </View>

        {/* Tournaments */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Tournaments
          </BebasText>
          {tournamentsQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
          ) : tournaments.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{'\uD83C\uDFC6'}</Text>
              <Text style={styles.emptyText}>No tournaments found</Text>
            </View>
          ) : (
            tournaments.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.tournamentCard}
                onPress={() => router.push(`/tournament/${t.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.tournamentInfo}>
                  <Text style={styles.tournamentName}>{t.name}</Text>
                  <Text style={styles.tournamentMeta}>
                    {t.status} {'\u00B7'} {new Date(t.startDate).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.chevron}>{'\u203A'}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Top Teams */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Top Teams
          </BebasText>
          {teamsQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
          ) : teams.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{'\uD83C\uDFDF\uFE0F'}</Text>
              <Text style={styles.emptyText}>No teams found</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={teams}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }) => (
                <View style={styles.teamCardWrapper}>
                  <TeamCard team={item} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              scrollEnabled
            />
          )}
        </View>

        {/* Top Players */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Top Players
          </BebasText>
          {playersQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
          ) : players.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{'\u26BD'}</Text>
              <Text style={styles.emptyText}>No players found</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={players}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }) => (
                <View style={styles.playerCardWrapper}>
                  <PlayerCard player={item} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              scrollEnabled
            />
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
  teamCardWrapper: {
    width: 260,
  },
  playerCardWrapper: {
    width: 280,
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
  tournamentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  tournamentMeta: {
    color: Colors.muted,
    fontSize: 12,
  },
  chevron: {
    color: Colors.muted,
    fontSize: 24,
    marginLeft: 8,
  },
});
