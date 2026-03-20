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
import {
  getPlayerById,
  followPlayer,
  unfollowPlayer,
  likePlayer,
  ratePlayer,
} from '../../services/playerService';
import BebasText from '../../components/ui/BebasText';
import Badge from '../../components/ui/Badge';
import PlayerRatings from '../../components/player/PlayerRatings';
import ShareStrip from '../../components/ui/ShareStrip';

const ROLE_COLORS: Record<string, string> = {
  BAT: Colors.blue,
  BOWL: Colors.green,
  AR: Colors.purple,
  WK: Colors.gold,
  FWD: Colors.red,
  MID: Colors.cyan,
  DEF: Colors.blue,
  GK: Colors.gold,
};

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  const playerQuery = useQuery({
    queryKey: ['player', id],
    queryFn: async () => {
      const { data } = await getPlayerById(id!);
      setIsFollowing(data.isFollowing ?? false);
      setLocalLikes(data.likesCount ?? 0);
      setHasLiked(data.hasLiked ?? false);
      return data as any;
    },
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await unfollowPlayer(id!);
      } else {
        await followPlayer(id!);
      }
    },
    onSuccess: () => {
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ['player', id] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await likePlayer(id!);
    },
    onSuccess: () => {
      setHasLiked(true);
      setLocalLikes((prev) => prev + 1);
    },
  });

  const rateMutation = useMutation({
    mutationFn: async (ratings: any) => {
      const overall =
        (ratings.skill + ratings.attitude + ratings.clutch + ratings.form) / 4;
      await ratePlayer(id!, { rating: overall, comment: '' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', id] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await playerQuery.refetch();
    setRefreshing(false);
  }, [playerQuery]);

  if (playerQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading player...</Text>
      </View>
    );
  }

  if (playerQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load player
        </BebasText>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const player = playerQuery.data;
  const initial = player?.name?.charAt(0)?.toUpperCase() || '?';
  const roleColor = ROLE_COLORS[player?.role] || Colors.muted;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={20} color={Colors.text}>
          Player
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
          <View style={styles.avatarLarge}>
            {player?.imageUrl ? (
              <Image source={{ uri: player.imageUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
          </View>

          <BebasText size={32} color={Colors.text}>
            {player?.name}
          </BebasText>

          <View style={styles.badgeRow}>
            <Badge label={player?.role ?? 'N/A'} color={roleColor} size="md" />
            {player?.teamId && (
              <Text style={styles.teamText}>{player.teamId}</Text>
            )}
            {player?.country && (
              <Text style={styles.countryFlag}>{player.country}</Text>
            )}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <BebasText size={22} color={Colors.text}>
              {(player?.followersCount ?? 0).toLocaleString()}
            </BebasText>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <BebasText size={22} color={Colors.text}>
              {localLikes.toLocaleString()}
            </BebasText>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.ratingDisplay}>
              <Text style={styles.starIcon}>{'\u2605'}</Text>
              <BebasText size={22} color={Colors.gold}>
                {(player?.overallRating ?? 0).toFixed(1)}
              </BebasText>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.followBtn,
              isFollowing ? styles.followBtnOutlined : styles.followBtnFilled,
            ]}
            onPress={() => followMutation.mutate()}
            disabled={followMutation.isPending}
            activeOpacity={0.7}
          >
            {followMutation.isPending ? (
              <ActivityIndicator
                color={isFollowing ? Colors.gold : Colors.bg}
                size="small"
              />
            ) : (
              <Text
                style={[
                  styles.followBtnText,
                  isFollowing
                    ? styles.followBtnTextOutlined
                    : styles.followBtnTextFilled,
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.likeBtn, hasLiked && styles.likeBtnActive]}
            onPress={() => !hasLiked && likeMutation.mutate()}
            disabled={hasLiked || likeMutation.isPending}
            activeOpacity={0.7}
          >
            <Text style={styles.likeBtnText}>
              {hasLiked ? '\u2764\uFE0F' : '\u2661'} {localLikes}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rate this Player */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Rate this Player
          </BebasText>
          <View style={{ marginTop: 10 }}>
            <PlayerRatings
              ratings={
                player?.ratings ?? {
                  skill: 0,
                  attitude: 0,
                  clutch: 0,
                  form: 0,
                }
              }
              overallRating={player?.overallRating ?? 0}
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
            contentType="player"
            data={{ id: player?.id, name: player?.name }}
          />
        </View>

        {/* Bio */}
        {player?.bio && (
          <View style={styles.section}>
            <BebasText size={20} color={Colors.text}>
              Bio
            </BebasText>
            <Text style={styles.bioText}>{player.bio}</Text>
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
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: Colors.text,
    fontSize: 40,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  teamText: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  countryFlag: {
    fontSize: 18,
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
    fontSize: 12,
    marginTop: 4,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    color: Colors.gold,
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  followBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnFilled: {
    backgroundColor: Colors.gold,
  },
  followBtnOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  followBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  followBtnTextFilled: {
    color: Colors.bg,
  },
  followBtnTextOutlined: {
    color: Colors.gold,
  },
  likeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtnActive: {
    borderColor: Colors.red,
  },
  likeBtnText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  bioText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
});
