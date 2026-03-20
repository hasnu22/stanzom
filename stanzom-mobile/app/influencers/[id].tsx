import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import api from '../../services/api';
import BebasText from '../../components/ui/BebasText';
import Badge from '../../components/ui/Badge';
import RatingBar from '../../components/ui/RatingBar';
import ShareStrip from '../../components/ui/ShareStrip';

export default function InfluencerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const influencerQuery = useQuery({
    queryKey: ['influencer', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/influencers/${id}`);
      setIsFollowing(data.isFollowing ?? false);
      setHasLiked(data.hasLiked ?? false);
      setLocalLikes(data.likesCount ?? 0);
      setUserRating(data.userRating ?? 0);
      return data as any;
    },
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await api.delete(`/api/influencers/${id}/follow`);
      } else {
        await api.post(`/api/influencers/${id}/follow`);
      }
    },
    onSuccess: () => {
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ['influencer', id] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/influencers/${id}/like`);
    },
    onSuccess: () => {
      setHasLiked(true);
      setLocalLikes((prev) => prev + 1);
    },
  });

  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      await api.post(`/api/influencers/${id}/rating`, { rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer', id] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await influencerQuery.refetch();
    setRefreshing(false);
  }, [influencerQuery]);

  const handleRate = (rating: number) => {
    setUserRating(rating);
    rateMutation.mutate(rating);
  };

  const handleSocialLink = async (url?: string) => {
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    }
  };

  if (influencerQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading influencer...</Text>
      </View>
    );
  }

  if (influencerQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load influencer
        </BebasText>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const influencer = influencerQuery.data;
  const initial = influencer?.displayName?.charAt(0)?.toUpperCase() || '?';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={20} color={Colors.text}>
          Influencer
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
          <View style={styles.avatarContainer}>
            {influencer?.imageUrl ? (
              <Image
                source={{ uri: influencer.imageUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
          </View>

          <View style={styles.nameRow}>
            <BebasText size={28} color={Colors.text}>
              {influencer?.displayName}
            </BebasText>
            {influencer?.isVerified && (
              <Text style={styles.verifiedBadge}>{'\u2713'}</Text>
            )}
          </View>

          <Text style={styles.handle}>@{influencer?.handle}</Text>

          {influencer?.bio && (
            <Text style={styles.bio}>{influencer.bio}</Text>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <BebasText size={22} color={Colors.text}>
              {(influencer?.followersCount ?? 0).toLocaleString()}
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
            <BebasText size={22} color={Colors.gold}>
              {(influencer?.overallRating ?? 0).toFixed(1)}
            </BebasText>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {influencer?.niche && (
            <Badge label={influencer.niche} color={Colors.purple} size="md" />
          )}
          {influencer?.platform && (
            <Badge label={influencer.platform} color={Colors.blue} size="md" />
          )}
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

        {/* Rate Section */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Rate this Influencer
          </BebasText>
          <View style={styles.rateCard}>
            <RatingBar
              rating={userRating}
              size={32}
              readonly={false}
              onRate={handleRate}
            />
            <Text style={styles.rateHint}>
              {userRating > 0
                ? `You rated ${userRating}/5`
                : 'Tap to rate'}
            </Text>
          </View>
        </View>

        {/* Social Link */}
        {influencer?.socialUrl && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => handleSocialLink(influencer.socialUrl)}
              activeOpacity={0.7}
            >
              <Text style={styles.socialBtnText}>
                {'\uD83D\uDD17'} Visit Social Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Share */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Share
          </BebasText>
          <ShareStrip
            contentType="influencer"
            data={{
              id: influencer?.id,
              name: influencer?.displayName,
              handle: influencer?.handle,
            }}
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
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
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
  avatarText: {
    color: Colors.text,
    fontSize: 40,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    color: Colors.cyan,
    fontSize: 22,
    fontWeight: '700',
  },
  handle: {
    color: Colors.muted,
    fontSize: 15,
    marginTop: 4,
  },
  bio: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
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
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
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
  rateCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  rateHint: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 8,
  },
  socialBtn: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 14,
    alignItems: 'center',
  },
  socialBtnText: {
    color: Colors.blue,
    fontSize: 15,
    fontWeight: '600',
  },
});
