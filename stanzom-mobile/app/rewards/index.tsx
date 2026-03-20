import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { getMyRewards, getReferralInfo } from '../../services/rewardService';
import BebasText from '../../components/ui/BebasText';
import RewardRow from '../../components/rewards/RewardRow';
import ReferralBlock from '../../components/rewards/ReferralBlock';

interface EarnAction {
  action: string;
  points: number;
  icon: string;
}

const EARN_ACTIONS: EarnAction[] = [
  { action: 'Share on WhatsApp', points: 10, icon: '\uD83D\uDCF1' },
  { action: 'Correct Prediction', points: 10, icon: '\uD83C\uDFAF' },
  { action: 'Rate a Player/Team', points: 5, icon: '\u2B50' },
  { action: 'Post on Buzz', points: 5, icon: '\uD83D\uDCAC' },
  { action: 'Refer a Friend', points: 25, icon: '\uD83D\uDC65' },
  { action: 'Daily Login', points: 2, icon: '\uD83D\uDD13' },
  { action: 'Share on Telegram', points: 10, icon: '\u2708\uFE0F' },
  { action: 'Post a Pundit Take', points: 5, icon: '\uD83E\uDD14' },
];

export default function RewardsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const rewardsQuery = useQuery({
    queryKey: ['rewards', 'my'],
    queryFn: async () => {
      const { data } = await getMyRewards();
      return data as any;
    },
  });

  const referralQuery = useQuery({
    queryKey: ['rewards', 'referral'],
    queryFn: async () => {
      const { data } = await getReferralInfo();
      return data as any;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([rewardsQuery.refetch(), referralQuery.refetch()]);
    setRefreshing(false);
  }, [rewardsQuery, referralQuery]);

  const totalPoints = rewardsQuery.data?.totalPoints ?? 0;
  const transactions = rewardsQuery.data?.transactions ?? [];
  const referral = referralQuery.data;

  const renderHeader = () => (
    <>
      {/* Total Points Card */}
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Total Points</Text>
        <BebasText size={56} color={Colors.gold}>
          {totalPoints.toLocaleString()}
        </BebasText>
        <Text style={styles.pointsSubtext}>Keep earning to unlock rewards!</Text>
      </View>

      {/* How to Earn Points */}
      <View style={styles.section}>
        <BebasText size={20} color={Colors.text}>
          How to Earn Points
        </BebasText>
        <View style={styles.earnList}>
          {EARN_ACTIONS.map((action, idx) => (
            <View key={idx} style={styles.earnRow}>
              <Text style={styles.earnIcon}>{action.icon}</Text>
              <Text style={styles.earnAction}>{action.action}</Text>
              <Text style={styles.earnPoints}>+{action.points}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Transaction History Header */}
      <BebasText size={20} color={Colors.text}>
        Transaction History
      </BebasText>
    </>
  );

  const renderEmpty = () => {
    if (rewardsQuery.isLoading) return null;
    return (
      <View style={styles.emptySection}>
        <Text style={styles.emptyIcon}>{'\uD83D\uDCB0'}</Text>
        <Text style={styles.emptyText}>No transactions yet</Text>
        <Text style={styles.emptySubtext}>
          Start predicting and sharing to earn points!
        </Text>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.referralSection}>
      {referralQuery.isLoading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginVertical: 20 }} />
      ) : referral ? (
        <ReferralBlock
          referralCode={referral.referralCode ?? '---'}
          totalReferrals={referral.totalReferrals ?? 0}
          totalPoints={referral.referralPoints ?? 0}
        />
      ) : null}
      <View style={{ height: 40 }} />
    </View>
  );

  if (rewardsQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading rewards...</Text>
      </View>
    );
  }

  if (rewardsQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load rewards
        </BebasText>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.gold}>
          REWARDS
        </BebasText>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item: any, index: number) => item.id ?? `tx-${index}`}
        renderItem={({ item }) => <RewardRow reward={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  pointsCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsLabel: {
    color: Colors.muted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pointsSubtext: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  earnList: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginTop: 10,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 10,
  },
  earnIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  earnAction: {
    color: Colors.text,
    fontSize: 14,
    flex: 1,
  },
  earnPoints: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '700',
  },
  emptySection: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    marginTop: 10,
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
    textAlign: 'center',
  },
  referralSection: {
    marginTop: 24,
  },
});
