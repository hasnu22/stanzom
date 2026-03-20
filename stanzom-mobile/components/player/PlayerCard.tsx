import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import Badge from '../ui/Badge';
import RatingBar from '../ui/RatingBar';

interface PlayerData {
  id: string;
  name: string;
  role: string;
  teamId: string;
  imageUrl?: string;
  followersCount: number;
  likesCount: number;
  overallRating: number;
  country?: string;
}

interface PlayerCardProps {
  player: PlayerData;
}

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

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const router = useRouter();
  const initial = player.name?.charAt(0)?.toUpperCase() || '?';
  const roleColor = ROLE_COLORS[player.role] || Colors.muted;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/player/${player.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {player.imageUrl ? (
          <Image source={{ uri: player.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Badge label={player.role} color={roleColor} size="sm" />
        </View>

        <Text style={styles.teamAbbr}>{player.teamId}</Text>

        <View style={styles.statsRow}>
          <RatingBar rating={player.overallRating} size={14} />
          <Text style={styles.followers}>
            {player.followersCount.toLocaleString()} followers
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  teamAbbr: {
    color: Colors.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  followers: {
    color: Colors.muted,
    fontSize: 11,
  },
});

export default PlayerCard;
