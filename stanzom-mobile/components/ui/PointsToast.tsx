import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface PointsToastProps {
  visible: boolean;
  points: number;
  message: string;
  onHide: () => void;
}

const PointsToast: React.FC<PointsToastProps> = ({
  visible,
  points,
  message,
  onHide,
}) => {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      // Auto-dismiss after 2.5 seconds
      translateY.value = withDelay(
        2500,
        withTiming(-100, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onHide)();
          }
        }),
      );
    } else {
      translateY.value = -100;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.pointsText}>+{points} PTS</Text>
      <Text style={styles.messageText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.green,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  pointsText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    color: Colors.bg,
    fontWeight: '700',
  },
  messageText: {
    fontSize: 14,
    color: Colors.bg,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default PointsToast;
