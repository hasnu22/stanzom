import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import BebasText from '../ui/BebasText';
import Badge from '../ui/Badge';

interface LiveScoreEvent {
  id: string;
  title: string;
  status: string;
  scoreHome?: number;
  scoreAway?: number;
  teamHomeId: string;
  teamAwayId: string;
  currentPeriod?: string;
  eventDate: string;
  venue?: string;
}

interface LiveScoreCardProps {
  event: LiveScoreEvent;
}

const LiveScoreCard: React.FC<LiveScoreCardProps> = ({ event }) => {
  const router = useRouter();
  const isLive = event.status === 'LIVE';
  const isUpcoming = event.status === 'UPCOMING';

  const getCountdown = () => {
    const eventTime = new Date(event.eventDate).getTime();
    const now = Date.now();
    const diff = eventTime - now;
    if (diff <= 0) return 'Starting soon';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${mins}m`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, isLive && styles.liveCard]}
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.7}
    >
      {isLive && (
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Badge label="LIVE" color={Colors.red} size="sm" />
          {event.currentPeriod && (
            <Text style={styles.period}>{event.currentPeriod}</Text>
          )}
        </View>
      )}

      <View style={styles.scoreRow}>
        <View style={styles.teamBlock}>
          <BebasText size={18} color={Colors.text}>
            {event.teamHomeId}
          </BebasText>
        </View>

        <View style={styles.scoreBlock}>
          {isUpcoming ? (
            <View style={styles.countdownBlock}>
              <BebasText size={20} color={Colors.muted}>
                {getCountdown()}
              </BebasText>
            </View>
          ) : (
            <BebasText size={36} color={Colors.text}>
              {event.scoreHome ?? 0} - {event.scoreAway ?? 0}
            </BebasText>
          )}
        </View>

        <View style={styles.teamBlock}>
          <BebasText size={18} color={Colors.text}>
            {event.teamAwayId}
          </BebasText>
        </View>
      </View>

      {event.venue && (
        <Text style={styles.venue}>{event.venue}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  liveCard: {
    borderColor: Colors.green,
    borderWidth: 1.5,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  period: {
    color: Colors.muted,
    fontSize: 13,
    marginLeft: 'auto',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  countdownBlock: {
    alignItems: 'center',
  },
  venue: {
    color: Colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LiveScoreCard;
