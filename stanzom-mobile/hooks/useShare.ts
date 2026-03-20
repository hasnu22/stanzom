import { useState, useCallback } from 'react';
import { Share, Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { shareMessages, platformPoints } from '../constants/shareMessages';
import { logShare } from '../services/rewardService';
import { useRewards } from './useRewards';

type Platform = 'wa' | 'tg' | 'x' | 'ig' | 'sc' | 'room' | 'copy';

const PLATFORM_URLS: Record<string, string> = {
  wa: 'whatsapp://send?text=',
  x: 'twitter://post?message=',
  sc: 'sharechat://share?text=',
  tg: 'tg://msg?text=',
  ig: 'instagram://sharesheet?text=',
};

export const useShare = () => {
  const [isRoomPickerVisible, setRoomPickerVisible] = useState(false);
  const { addPoints } = useRewards();

  const doShare = useCallback(
    async (platform: Platform, contentType: string, data: Record<string, any>) => {
      const messageGenerator = shareMessages[contentType];
      if (!messageGenerator) {
        console.warn(`No share message template for contentType: ${contentType}`);
        return;
      }

      const message = messageGenerator(data);

      try {
        if (platform === 'copy') {
          await Clipboard.setStringAsync(message);
          Alert.alert('Copied', 'Link copied to clipboard');
        } else if (platform === 'room') {
          setRoomPickerVisible(true);
          return; // Points awarded after room selection
        } else {
          const platformUrl = PLATFORM_URLS[platform];
          if (platformUrl) {
            const url = `${platformUrl}${encodeURIComponent(message)}`;
            const canOpen = await Linking.canOpenURL(url);

            if (canOpen) {
              await Linking.openURL(url);
            } else {
              // Fallback to native share sheet
              await Share.share({ message });
            }
          } else {
            await Share.share({ message });
          }
        }

        // Log the share and award points
        const contentId = data.id || '';
        await logShare(platform, contentType, contentId).catch(() => {
          // Silently fail - points may still be awarded locally
        });

        const points = platformPoints[platform] || 5;
        addPoints(points, `+${points} pts for sharing on ${platform.toUpperCase()}`);
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', error);
      }
    },
    [addPoints],
  );

  return { doShare, isRoomPickerVisible, setRoomPickerVisible };
};
