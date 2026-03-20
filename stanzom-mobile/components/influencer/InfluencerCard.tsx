import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import Badge from '../ui/Badge';
import RatingBar from '../ui/RatingBar';

interface InfluencerData {
  id: string;
  displayName: string;
  handle: string;
  bio?: string;
  niche: string;
  platform: string;
  followersCount: number;
  overallRating: number;
  isVerified: boolean;
  isFeatured: boolean;
  imageUrl?: string;
}

interface InfluencerCardProps {
  influencer: InfluencerData;
}

const InfluencerCard: React.FC<InfluencerCardProps> = ({ influencer }) => {
  const initial = influencer.displayName?.charAt(0)?.toUpperCase() || '?';

  return (
    <View
      style={[
        styles.card,
        influencer.isFeatured && styles.featuredCard,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          {influencer.imageUrl ? (
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

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {influencer.displayName}
            </Text>
            {influencer.isVerified && (
              <Text style={styles.verifiedBadge}>{'\u2713'}</Text>
            )}
          </View>
          <Text style={styles.handle}>@{influencer.handle}</Text>

          <View style={styles.tagsRow}>
            <Badge label={influencer.niche} color={Colors.purple} size="sm" />
            <Badge label={influencer.platform} color={Colors.blue} size="sm" />
          </View>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <RatingBar rating={influencer.overallRating} size={14} />
        <Text style={styles.followers}>
          {influencer.followersCount.toLocaleString()} followers
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 10,
  },
  featuredCard: {
    borderColor: Colors.gold,
    borderWidth: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  verifiedBadge: {
    color: Colors.cyan,
    fontSize: 16,
    fontWeight: '700',
  },
  handle: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  followers: {
    color: Colors.muted,
    fontSize: 12,
  },
});

export default InfluencerCard;
