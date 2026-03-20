import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import Badge from '../ui/Badge';
import ShareStrip from '../ui/ShareStrip';

interface Pick {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

interface PunditPostData {
  id: string;
  userId: string;
  userName: string;
  takeText: string;
  likesCount: number;
  userAccuracy: number;
  userRankAtPost: number;
  createdAt: string;
  picks: Pick[];
}

interface PunditPostProps {
  post: PunditPostData;
}

const getTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const PunditPost: React.FC<PunditPostProps> = ({ post }) => {
  const initial = post.userName?.charAt(0)?.toUpperCase() || '?';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Badge
              label={`${post.userAccuracy}%`}
              color={post.userAccuracy >= 50 ? Colors.green : Colors.red}
              size="sm"
            />
          </View>
          <Text style={styles.meta}>
            Rank #{post.userRankAtPost} {'\u00B7'} {getTimeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={styles.takeText}>{post.takeText}</Text>

      {post.picks.length > 0 && (
        <View style={styles.picksList}>
          {post.picks.map((pick, idx) => (
            <View key={idx} style={styles.pickRow}>
              <Text
                style={[
                  styles.pickIcon,
                  { color: pick.isCorrect ? Colors.green : Colors.red },
                ]}
              >
                {pick.isCorrect ? '\u2713' : '\u2717'}
              </Text>
              <View style={styles.pickInfo}>
                <Text style={styles.pickQuestion} numberOfLines={1}>
                  {pick.questionText}
                </Text>
                <Text style={styles.pickAnswer}>
                  {pick.userAnswer}
                  {!pick.isCorrect && (
                    <Text style={styles.correctAnswer}>
                      {' '}
                      (Correct: {pick.correctAnswer})
                    </Text>
                  )}
                </Text>
              </View>
              <Text
                style={[
                  styles.pickPoints,
                  { color: pick.isCorrect ? Colors.green : Colors.red },
                ]}
              >
                {pick.isCorrect ? '+' : ''}
                {pick.pointsEarned}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.likeBtn} activeOpacity={0.7}>
          <Text style={styles.likeText}>
            {'\u2764'} {post.likesCount}
          </Text>
        </TouchableOpacity>
      </View>

      <ShareStrip contentType="pundit" data={post} />
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
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  takeText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  picksList: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickIcon: {
    fontSize: 16,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  pickInfo: {
    flex: 1,
  },
  pickQuestion: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  pickAnswer: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 1,
  },
  correctAnswer: {
    color: Colors.red,
    fontSize: 11,
  },
  pickPoints: {
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  likeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.bg,
  },
  likeText: {
    color: Colors.muted,
    fontSize: 13,
  },
});

export default PunditPost;
