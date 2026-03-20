import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface RatingBarProps {
  rating: number;
  maxRating?: number;
  size?: number;
  readonly?: boolean;
  onRate?: (rating: number) => void;
  color?: string;
}

const RatingBar: React.FC<RatingBarProps> = ({
  rating,
  maxRating = 5,
  size = 24,
  readonly = true,
  onRate,
  color = Colors.gold,
}) => {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  const renderStar = (index: number) => {
    const filled = index <= Math.round(rating);
    const starChar = filled ? '\u2605' : '\u2606';

    if (readonly) {
      return (
        <Text key={index} style={[styles.star, { fontSize: size, color }]}>
          {starChar}
        </Text>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onRate?.(index)}
        activeOpacity={0.6}
      >
        <Text style={[styles.star, { fontSize: size, color }]}>{starChar}</Text>
      </TouchableOpacity>
    );
  };

  return <View style={styles.container}>{stars.map(renderStar)}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default RatingBar;
