import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import Badge from '../ui/Badge';

interface RoomData {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  eventId?: string;
  sportId?: string;
  isActive: boolean;
  createdAt: string;
}

interface RoomCardProps {
  room: RoomData;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/rooms/${room.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{'\uD83C\uDFE0'}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {room.name}
          </Text>
          {room.isActive && (
            <View style={styles.activeDot} />
          )}
        </View>
        <View style={styles.metaRow}>
          <Badge
            label={`${room.memberCount} members`}
            color={Colors.purple}
            size="sm"
          />
          {room.sportId && (
            <Text style={styles.sportIcon}>{'\u26BD'}</Text>
          )}
        </View>
      </View>

      <Text style={styles.arrow}>&gt;</Text>
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportIcon: {
    fontSize: 14,
  },
  arrow: {
    color: Colors.muted,
    fontSize: 18,
    marginLeft: 8,
  },
});

export default RoomCard;
