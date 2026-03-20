import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useShare } from '../../hooks/useShare';

interface ShareStripProps {
  contentType: string;
  data: any;
  onRoomShare?: () => void;
}

type PlatformKey = 'wa' | 'tg' | 'x' | 'ig' | 'sc' | 'room' | 'copy';

interface PlatformConfig {
  key: PlatformKey;
  label: string;
  bg: string;
  textColor: string;
}

const PLATFORMS: PlatformConfig[] = [
  { key: 'wa', label: 'WA', bg: '#25D366', textColor: '#FFFFFF' },
  { key: 'tg', label: 'TG', bg: '#0088cc', textColor: '#FFFFFF' },
  { key: 'x', label: 'X', bg: '#000000', textColor: '#FFFFFF' },
  { key: 'ig', label: 'IG', bg: '#E4405F', textColor: '#FFFFFF' },
  { key: 'sc', label: 'SC', bg: '#FF5733', textColor: '#FFFFFF' },
  { key: 'room', label: '🏠', bg: Colors.purple, textColor: '#FFFFFF' },
  { key: 'copy', label: '📋', bg: Colors.muted, textColor: '#FFFFFF' },
];

const ShareStrip: React.FC<ShareStripProps> = ({
  contentType,
  data,
  onRoomShare,
}) => {
  const { doShare } = useShare();

  const handlePress = (platform: PlatformKey) => {
    if (platform === 'room' && onRoomShare) {
      onRoomShare();
      return;
    }
    doShare(platform, contentType, data);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {PLATFORMS.map((p) => (
        <TouchableOpacity
          key={p.key}
          style={[styles.button, { backgroundColor: p.bg }]}
          onPress={() => handlePress(p.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, { color: p.textColor }]}>{p.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ShareStrip;
