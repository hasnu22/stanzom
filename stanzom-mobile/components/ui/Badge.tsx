import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.gold,
  size = 'sm',
}) => {
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { fontSize: isSmall ? 10 : 12 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  label: {
    color: Colors.bg,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default Badge;
