import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface RewardData {
  id: string;
  points: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

interface RewardRowProps {
  reward: RewardData;
}

const TYPE_ICONS: Record<string, string> = {
  PREDICTION: '\uD83C\uDFAF',
  SHARE: '\uD83D\uDD17',
  REFERRAL: '\uD83D\uDC65',
  BUZZ: '\uD83D\uDCAC',
  RATING: '\u2B50',
  BONUS: '\uD83C\uDF81',
};

const getTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const RewardRow: React.FC<RewardRowProps> = ({ reward }) => {
  const isPositive = reward.points >= 0;
  const icon = TYPE_ICONS[reward.transactionType] || '\uD83D\uDCB0';

  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {reward.description}
        </Text>
        <Text style={styles.timeAgo}>{getTimeAgo(reward.createdAt)}</Text>
      </View>

      <Text
        style={[
          styles.points,
          { color: isPositive ? Colors.green : Colors.red },
        ]}
      >
        {isPositive ? '+' : ''}
        {reward.points}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  description: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  timeAgo: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  points: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default RewardRow;
