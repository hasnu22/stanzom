import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { addReaction } from '../../services/eventService';

interface Reaction {
  emoji: string;
  count: number;
}

interface EmojiReactionBarProps {
  eventId: string;
  reactions: Reaction[];
}

const EMOJIS = ['\uD83D\uDD25', '\uD83D\uDE31', '\uD83D\uDC4F', '\uD83D\uDCAA', '\uD83D\uDE02', '\u2764\uFE0F'];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const EmojiButton: React.FC<{
  emoji: string;
  count: number;
  onPress: () => void;
}> = ({ emoji, count, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[styles.emojiButton, animatedStyle]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.count}>{count}</Text>
    </AnimatedTouchable>
  );
};

const EmojiReactionBar: React.FC<EmojiReactionBarProps> = ({
  eventId,
  reactions,
}) => {
  const getCount = (emoji: string) => {
    const found = reactions.find((r) => r.emoji === emoji);
    return found?.count ?? 0;
  };

  const handleReact = async (emoji: string) => {
    try {
      await addReaction(eventId, emoji);
    } catch (err) {
      // Silently fail
    }
  };

  return (
    <View style={styles.container}>
      {EMOJIS.map((emoji) => (
        <EmojiButton
          key={emoji}
          emoji={emoji}
          count={getCount(emoji)}
          onPress={() => handleReact(emoji)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  emojiButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emoji: {
    fontSize: 24,
  },
  count: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default EmojiReactionBar;
