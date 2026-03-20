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
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { getMyRewards, getReferralInfo } from '../../services/rewardService';
import { getLeaderboard } from '../../services/predictionService';
import BebasText from '../../components/ui/BebasText';
import ShareStrip from '../../components/ui/ShareStrip';
import RewardRow from '../../components/rewards/RewardRow';
import ReferralBlock from '../../components/rewards/ReferralBlock';

export default function MeScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);

  // Fetch rewards
  const rewardsQuery = useQuery({
    queryKey: ['myRewards'],
    queryFn: async () => {
      const data = await getMyRewards();
      return data as any;
    },
  });

  // Fetch referral info
  const referralQuery = useQuery({
    queryKey: ['referralInfo'],
    queryFn: async () => {
      const data = await getReferralInfo();
      return data as any;
    },
  });

  // Fetch leaderboard for user rank
  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard', 'GLOBAL', 'me'],
    queryFn: async () => {
      const data = await getLeaderboard({ scope: 'GLOBAL' });
      return data as any[];
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      rewardsQuery.refetch(),
      referralQuery.refetch(),
      leaderboardQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [rewardsQuery, referralQuery, leaderboardQuery]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const initial = (user?.displayName ?? user?.mobileNumber ?? '?').charAt(0).toUpperCase();
  const displayName = user?.displayName ?? 'Fan';
  const username = user?.mobileNumber ?? '';
  const city = user?.city ?? '';

  const totalPoints = user?.totalPoints ?? 0;
  const accuracy = user?.accuracy ?? 0;
  const rank = user?.rank ?? 0;

  // Calculate active days from rewards data
  const rewardsList = rewardsQuery.data?.transactions ?? rewardsQuery.data ?? [];
  const uniqueDays = new Set(
    (Array.isArray(rewardsList) ? rewardsList : []).map((r: any) =>
      new Date(r.createdAt).toDateString(),
    ),
  );
  const activeDays = uniqueDays.size;

  const recentRewards = (Array.isArray(rewardsList) ? rewardsList : []).slice(0, 3);

  // Loading
  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <BebasText size={36} color={Colors.gold}>
              {initial}
            </BebasText>
          </View>
          <BebasText size={28} color={Colors.text}>
            {displayName}
          </BebasText>
          {username ? (
            <Text style={styles.username}>{username}</Text>
          ) : null}
          {city ? (
            <Text style={styles.city}>{'\uD83D\uDCCD'} {city}</Text>
          ) : null}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <BebasText size={24} color={Colors.gold}>
              {totalPoints}
            </BebasText>
            <Text style={styles.statLabel}>Season Points</Text>
          </View>
          <View style={styles.statCard}>
            <BebasText size={24} color={Colors.green}>
              {Math.round(accuracy)}%
            </BebasText>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <BebasText size={24} color={Colors.blue}>
              {activeDays}
            </BebasText>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
          <View style={styles.statCard}>
            <BebasText size={24} color={Colors.purple}>
              #{rank || '-'}
            </BebasText>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>

        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* My Predictions */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            My Predictions
          </BebasText>
          <View style={styles.predictionSummary}>
            <View style={styles.predictionStatRow}>
              <Text style={styles.predictionStatLabel}>Total Points</Text>
              <BebasText size={20} color={Colors.gold}>
                {totalPoints}
              </BebasText>
            </View>
            <View style={styles.predictionStatRow}>
              <Text style={styles.predictionStatLabel}>Accuracy</Text>
              <BebasText size={20} color={accuracy >= 50 ? Colors.green : Colors.red}>
                {Math.round(accuracy)}%
              </BebasText>
            </View>
            <View style={styles.predictionStatRow}>
              <Text style={styles.predictionStatLabel}>Global Rank</Text>
              <BebasText size={20} color={Colors.blue}>
                #{rank || '-'}
              </BebasText>
            </View>
          </View>
        </View>

        {/* My Rewards */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <BebasText size={20} color={Colors.text}>
              My Rewards
            </BebasText>
            <TouchableOpacity
              onPress={() => router.push('/rewards')}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllLink}>See All {'\u2192'}</Text>
            </TouchableOpacity>
          </View>
          {rewardsQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
          ) : recentRewards.length === 0 ? (
            <View style={styles.emptyRewards}>
              <Text style={styles.emptyRewardsEmoji}>{'\uD83C\uDF81'}</Text>
              <Text style={styles.emptyRewardsText}>
                No reward transactions yet. Start predicting and sharing!
              </Text>
            </View>
          ) : (
            <View style={styles.rewardsCard}>
              {recentRewards.map((reward: any) => (
                <RewardRow key={reward.id} reward={reward} />
              ))}
            </View>
          )}
        </View>

        {/* Referral */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Referral
          </BebasText>
          {referralQuery.isLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 12 }} />
          ) : referralQuery.data ? (
            <View style={{ marginTop: 10 }}>
              <ReferralBlock
                referralCode={referralQuery.data.referralCode ?? 'LOADING'}
                totalReferrals={referralQuery.data.totalReferrals ?? 0}
                totalPoints={referralQuery.data.totalPoints ?? 0}
              />
            </View>
          ) : (
            <View style={styles.emptyRewards}>
              <Text style={styles.emptyRewardsText}>Referral info not available.</Text>
            </View>
          )}
        </View>

        {/* Share Profile */}
        <View style={styles.section}>
          <BebasText size={20} color={Colors.text}>
            Share Profile
          </BebasText>
          <View style={{ marginTop: 8 }}>
            <ShareStrip
              contentType="profile"
              data={{
                displayName,
                totalPoints,
                accuracy,
                rank,
              }}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  username: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  city: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.muted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  editProfileButton: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  editProfileText: {
    color: Colors.gold,
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllLink: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  predictionSummary: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginTop: 10,
  },
  predictionStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  predictionStatLabel: {
    color: Colors.muted,
    fontSize: 14,
  },
  rewardsCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  emptyRewards: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyRewardsEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyRewardsText: {
    color: Colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: Colors.red,
    fontSize: 16,
    fontWeight: '600',
  },
});
