import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface MessageData {
  id: string;
  userId: string;
  userName: string;
  content: string;
  messageType?: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: MessageData;
  isOwn: boolean;
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <View
      style={[
        styles.wrapper,
        isOwn ? styles.wrapperOwn : styles.wrapperOther,
      ]}
    >
      {!isOwn && <Text style={styles.userName}>{message.userName}</Text>}
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text
          style={[
            styles.content,
            isOwn ? styles.contentOwn : styles.contentOther,
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.time,
            isOwn ? styles.timeOwn : styles.timeOther,
          ]}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
    maxWidth: '78%',
  },
  wrapperOwn: {
    alignSelf: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
  },
  userName: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
    marginLeft: 10,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOwn: {
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  contentOwn: {
    color: Colors.bg,
  },
  contentOther: {
    color: Colors.text,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeOwn: {
    color: 'rgba(7,9,15,0.5)',
  },
  timeOther: {
    color: Colors.muted,
  },
});

export default MessageBubble;
