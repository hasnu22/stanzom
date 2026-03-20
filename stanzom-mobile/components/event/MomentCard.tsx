import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import BebasText from '../ui/BebasText';
import Badge from '../ui/Badge';

interface MomentData {
  content: string;
  postType: string;
  eventMoment?: string;
  likesCount: number;
  userName: string;
}

interface MomentCardProps {
  moment: MomentData;
}

const MomentCard: React.FC<MomentCardProps> = ({ moment }) => {
  return (
    <View style={styles.outerBorder}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.fireEmoji}>{'\uD83D\uDD25'}</Text>
          <Badge label="Top Moment" color={Colors.gold} size="sm" />
        </View>

        <Text style={styles.content}>{moment.content}</Text>

        <View style={styles.footer}>
          <Text style={styles.userName}>{moment.userName}</Text>
          {moment.eventMoment && (
            <Text style={styles.eventMoment}>{moment.eventMoment}</Text>
          )}
          <Text style={styles.likes}>
            {'\u2764'} {moment.likesCount}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerBorder: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.gold,
    padding: 2,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fireEmoji: {
    fontSize: 20,
  },
  content: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  eventMoment: {
    color: Colors.muted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  likes: {
    color: Colors.muted,
    fontSize: 12,
    marginLeft: 'auto',
  },
});

export default MomentCard;
