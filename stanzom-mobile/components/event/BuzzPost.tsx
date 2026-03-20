import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import Badge from '../ui/Badge';

interface BuzzPostData {
  id: string;
  userId: string;
  userName: string;
  content: string;
  postType: string;
  eventMoment?: string;
  likesCount: number;
  createdAt: string;
}

interface BuzzPostProps {
  post: BuzzPostData;
}

const POST_TYPE_COLORS: Record<string, string> = {
  SIX: Colors.gold,
  WICKET: Colors.red,
  GOAL: Colors.green,
  HOT_TAKE: Colors.purple,
};

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

const BuzzPost: React.FC<BuzzPostProps> = ({ post }) => {
  const typeColor = POST_TYPE_COLORS[post.postType] || Colors.muted;
  const initial = post.userName?.charAt(0)?.toUpperCase() || '?';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.timeAgo}>{getTimeAgo(post.createdAt)}</Text>
        </View>
        <Badge label={post.postType} color={typeColor} size="sm" />
      </View>

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.footer}>
        {post.eventMoment && (
          <Text style={styles.moment}>{post.eventMoment}</Text>
        )}
        <Text style={styles.likes}>
          {'\u2764'} {post.likesCount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  timeAgo: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 1,
  },
  content: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moment: {
    color: Colors.muted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  likes: {
    color: Colors.muted,
    fontSize: 12,
  },
});

export default BuzzPost;
