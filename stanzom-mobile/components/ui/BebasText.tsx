import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface BebasTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  size?: number;
  color?: string;
}

const BebasText: React.FC<BebasTextProps> = ({
  children,
  style,
  size = 24,
  color = Colors.text,
}) => {
  return (
    <Text style={[styles.base, { fontSize: size, color }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'BebasNeue_400Regular',
  },
});

export default BebasText;
