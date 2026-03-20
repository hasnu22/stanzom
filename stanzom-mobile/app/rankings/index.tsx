import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { SPORTS } from '../../constants/sports';
import { getLeaderboard } from '../../services/predictionService';
import { useAuth } from '../../hooks/useAuth';
import BebasText from '../../components/ui/BebasText';
import ShareStrip from '../../components/ui/ShareStrip';

type Scope = 'CITY' | 'STATE' | 'GLOBAL';
const SCOPES: Scope[] = ['CITY', 'STATE', 'GLOBAL'];
const ALL_SPORTS = [{ slug: 'all', name: 'All', icon: '\uD83C\uDFC6', color: Colors.gold }, ...SPORTS];

const RANK_BADGES: Record<number, { bg: string; label: string }> = {
  1: { bg: '#FFD700', label: '\uD83E\uDD47' },
  2: { bg: '#C0C0C0', label: '\uD83E\uDD48' },
  3: { bg: '#CD7F32', label: '\uD83E\uDD49' },
};

export default function RankingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedScope, setSelectedScope] = useState<Scope>('GLOBAL');
  const [selectedSport, setSelectedSport] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const sportSlugParam = selectedSport === 'all' ? undefined : selectedSport;

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', selectedScope, sportSlugParam],
    queryFn: async () => {
      const { data } = await getLeaderboard({
        scope: selectedScope,
        sportSlug: sportSlugParam,
        city: selectedScope === 'CITY' ? user?.city : undefined,
        state: selectedScope === 'STATE' ? user?.state : undefined,
      });
      return data as any[];
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await leaderboardQuery.refetch();
    setRefreshing(false);
  }, [leaderboardQuery]);

  const entries = leaderboardQuery.data ?? [];
  const currentUserId = user?.id;

  const renderTopThree = () => {
    const top3 = entries.slice(0, 3);
    if (top3.length === 0) return null;

    return (
      <View style={styles.topThreeContainer}>
        {top3.map((entry: any, index: number) => {
          const rank = index + 1;
          const badge = RANK_BADGES[rank];
          const isFirst = rank === 1;
          return (
            <View
              key={entry.id ?? index}
              style={[
                styles.topCard,
                isFirst && styles.topCardFirst,
                { borderColor: badge.bg },
              ]}
            >
              <Text style={styles.topBadge}>{badge.label}</Text>
              <View
                style={[
                  styles.topAvatar,
                  { borderColor: badge.bg },
                  isFirst && styles.topAvatarFirst,
                ]}
              >
                <Text style={[styles.topAvatarText, isFirst && styles.topAvatarTextFirst]}>
                  {(entry.displayName ?? entry.userName ?? '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.topName} numberOfLines={1}>
                {entry.displayName ?? entry.userName ?? 'Fan'}
              </Text>
              <BebasText
                size={isFirst ? 28 : 22}
                color={Colors.gold}
              >
                {entry.totalPoints ?? entry.points ?? 0}
              </BebasText>
              <Text style={styles.topAccuracy}>
                {entry.accuracy != null
                  ? `${Math.round(entry.accuracy)}%`
                  : '-'}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const rank = index + 4; // top 3 shown separately
      const isCurrentUser = item.userId === currentUserId;

      return (
        <View
          style={[styles.row, isCurrentUser && styles.rowHighlighted]}
        >
          <View style={styles.rankCircle}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
          <View style={styles.rowAvatar}>
            <Text style={styles.rowAvatarText}>
              {(item.displayName ?? item.userName ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName} numberOfLines={1}>
              {item.displayName ?? item.userName ?? 'Fan'}
              {isCurrentUser ? ' (You)' : ''}
            </Text>
            <Text style={styles.rowAccuracy}>
              {item.accuracy != null
                ? `${Math.round(item.accuracy)}% accuracy`
                : ''}
            </Text>
          </View>
          <BebasText size={18} color={Colors.gold}>
            {item.totalPoints ?? item.points ?? 0}
          </BebasText>
        </View>
      );
    },
    [currentUserId],
  );

  const renderHeader = () => (
    <>
      {/* Scope Selector */}
      <View style={styles.scopeRow}>
        {SCOPES.map((scope) => (
          <TouchableOpacity
            key={scope}
            style={[
              styles.scopePill,
              selectedScope === scope && styles.scopePillActive,
            ]}
            onPress={() => setSelectedScope(scope)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scopeText,
                selectedScope === scope && styles.scopeTextActive,
              ]}
            >
              {scope}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sport Selector */}
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

      {/* Top 3 */}
      {renderTopThree()}
    </>
  );

  const renderEmpty = () => {
    if (leaderboardQuery.isLoading) return null;
    return (
      <View style={styles.emptySection}>
        <Text style={styles.emptyIcon}>{'\uD83C\uDFC6'}</Text>
        <Text style={styles.emptyText}>No rankings yet</Text>
        <Text style={styles.emptySubtext}>Start predicting to climb the leaderboard!</Text>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.shareSection}>
      <ShareStrip
        contentType="ranking"
        data={{
          id: currentUserId,
          scope: selectedScope,
          sport: selectedSport,
        }}
      />
      <View style={{ height: 40 }} />
    </View>
  );

  const restOfEntries = entries.slice(3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.gold}>
          RANKINGS
        </BebasText>
        <View style={styles.backBtn} />
      </View>

      {leaderboardQuery.isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      ) : leaderboardQuery.isError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
          <BebasText size={22} color={Colors.red}>
            Failed to load rankings
          </BebasText>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={restOfEntries}
          keyExtractor={(item: any, index: number) => item.id ?? `r-${index}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={entries.length === 0 ? renderEmpty : undefined}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold}
              colors={[Colors.gold]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  loadingContainer: {
    flex: 1,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scopePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  scopePillActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  scopeText: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  scopeTextActive: {
    color: Colors.bg,
  },
  pillsContainer: {
    gap: 8,
    paddingVertical: 8,
    marginBottom: 12,
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
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  topCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
  },
  topCardFirst: {
    paddingVertical: 20,
  },
  topBadge: {
    fontSize: 24,
    marginBottom: 8,
  },
  topAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  topAvatarFirst: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  topAvatarText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  topAvatarTextFirst: {
    fontSize: 22,
  },
  topName: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  topAccuracy: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  rowHighlighted: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 2,
    paddingHorizontal: 12,
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
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatarText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  rowAccuracy: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  emptySection: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  shareSection: {
    marginTop: 20,
  },
});
