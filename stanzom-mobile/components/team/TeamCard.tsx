import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import RatingBar from '../ui/RatingBar';

interface TeamData {
  id: string;
  shortName: string;
  fullName: string;
  logoUrl?: string;
  city?: string;
  followersCount: number;
  overallRating: number;
  primaryColor?: string;
}

interface TeamCardProps {
  team: TeamData;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const router = useRouter();
  const teamColor = team.primaryColor || Colors.gold;
  const initial = team.shortName?.charAt(0)?.toUpperCase() || '?';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/team/${team.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.colorStripe, { backgroundColor: teamColor }]} />

      <View style={styles.logoContainer}>
        {team.logoUrl ? (
          <Image source={{ uri: team.logoUrl }} style={styles.logo} />
        ) : (
          <View style={[styles.logoPlaceholder, { borderColor: teamColor }]}>
            <Text style={[styles.logoText, { color: teamColor }]}>
              {initial}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.fullName} numberOfLines={1}>
          {team.fullName}
        </Text>
        {team.city && <Text style={styles.city}>{team.city}</Text>}
        <View style={styles.statsRow}>
          <RatingBar rating={team.overallRating} size={14} />
          <Text style={styles.followers}>
            {team.followersCount.toLocaleString()} fans
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  colorStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  logoContainer: {
    padding: 14,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    paddingRight: 14,
  },
  fullName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  city: {
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

export default TeamCard;
