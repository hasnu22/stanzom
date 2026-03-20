import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import api from '../../services/api';
import BebasText from '../../components/ui/BebasText';
import PlayerCard from '../../components/player/PlayerCard';
import TeamRatings from '../../components/team/TeamRatings';
import ShareStrip from '../../components/ui/ShareStrip';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const teamQuery = useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/teams/${id}`);
      setIsFollowing(data.isFollowing ?? false);
      return data as any;
    },
    enabled: !!id,
  });

  const squadQuery = useQuery({
    queryKey: ['team', id, 'squad'],
    queryFn: async () => {
      const { data } = await api.get(`/api/teams/${id}/squad`);
      return data as any[];
    },
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await api.delete(`/api/teams/${id}/follow`);
      } else {
        await api.post(`/api/teams/${id}/follow`);
      }
    },
    onSuccess: () => {
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
  });

  const rateMutation = useMutation({
    mutationFn: async (ratings: any) => {
      const overall =
        (ratings.squad + ratings.strategy + ratings.management + ratings.fanexp) / 4;
      await api.post(`/api/teams/${id}/rating`, { rating: overall });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([teamQuery.refetch(), squadQuery.refetch()]);
    setRefreshing(false);
  }, [teamQuery, squadQuery]);

  if (teamQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading team...</Text>
      </View>
    );
  }

  if (teamQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load team
        </BebasText>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const team = teamQuery.data;
  const squad = squadQuery.data ?? [];
  const teamColor = team?.primaryColor || Colors.gold;
  const initial = team?.shortName?.charAt(0)?.toUpperCase() || '?';

  return (
    <View style={styles.container}>
      {/* Color stripe at top */}
      <View style={[styles.topStripe, { backgroundColor: teamColor }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={20} color={Colors.text}>
          Team
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            {team?.logoUrl ? (
              <Image source={{ uri: team.logoUrl }} style={styles.logo} />
            ) : (
              <View style={[styles.logoPlaceholder, { borderColor: teamColor }]}>
                <Text style={[styles.logoText, { color: teamColor }]}>{initial}</Text>
              </View>
            )}
          </View>

          <BebasText size={30} color={Colors.text}>
            {team?.fullName}
          </BebasText>

          {team?.city && (
            <Text style={styles.cityText}>
              {team.city}
              {team?.homeGround ? ` \u00B7 ${team.homeGround}` : ''}
            </Text>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <BebasText size={22} color={Colors.text}>
              {(team?.followersCount ?? 0).toLocaleString()}
            </BebasText>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <BebasText size={22} color={Colors.gold}>
              {(team?.overallRating ?? 0).toFixed(1)}
            </BebasText>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <BebasText size={22} color={Colors.text}>
              {team?.titlesWon ?? 0}
            </BebasText>
            <Text style={styles.statLabel}>Titles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <BebasText size={22} color={Colors.text}>
              {team?.foundedYear ?? '-'}
            </BebasText>
            <Text style={styles.statLabel}>Founded</Text>
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          style={[
            styles.followBtn,
            isFollowing ? styles.followBtnOutlined : styles.followBtnFilled,
            { borderColor: teamColor },
            !isFollowing && { backgroundColor: teamColor },
          ]}
          onPress={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          activeOpacity={0.7}
        >
          {followMutation.isPending ? (
            <ActivityIndicator
              color={isFollowing ? teamColor : Colors.bg}
              size="small"
            />
          ) : (
            <Text
              style={[
                styles.followBtnText,
                { color: isFollowing ? teamColor : Colors.bg },
              ]}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Squad Section */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Squad
          </BebasText>
          {squadQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
          ) : squad.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyIcon}>{'\uD83D\uDC64'}</Text>
              <Text style={styles.emptyText}>No squad data available</Text>
            </View>
          ) : (
            <View style={{ marginTop: 10 }}>
              {squad.map((player: any) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </View>
          )}
        </View>

        {/* Rate Section */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Rate this Team
          </BebasText>
          <View style={{ marginTop: 10 }}>
            <TeamRatings
              ratings={
                team?.ratings ?? {
                  squad: 0,
                  strategy: 0,
                  management: 0,
                  fanexp: 0,
                }
              }
              overallRating={team?.overallRating ?? 0}
              onRate={(ratings) => rateMutation.mutate(ratings)}
            />
          </View>
        </View>

        {/* Share */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Share
          </BebasText>
          <ShareStrip
            contentType="team"
            data={{ id: team?.id, name: team?.fullName }}
          />
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
  topStripe: {
    height: 6,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
  },
  cityText: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  statLabel: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  followBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  followBtnFilled: {},
  followBtnOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  followBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
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
});
