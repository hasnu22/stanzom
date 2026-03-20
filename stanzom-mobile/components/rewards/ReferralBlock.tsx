import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../../constants/colors';
import BebasText from '../ui/BebasText';

interface ReferralBlockProps {
  referralCode: string;
  totalReferrals: number;
  totalPoints: number;
}

const ReferralBlock: React.FC<ReferralBlockProps> = ({
  referralCode,
  totalReferrals,
  totalPoints,
}) => {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <BebasText size={22} color={Colors.gold}>
        Your Referral Code
      </BebasText>

      <View style={styles.codeRow}>
        <BebasText size={36} color={Colors.text}>
          {referralCode}
        </BebasText>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Text style={styles.copyButtonText}>{'\uD83D\uDCCB'} COPY</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <BebasText size={24} color={Colors.text}>
            {totalReferrals}
          </BebasText>
          <Text style={styles.statLabel}>Referrals</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <BebasText size={24} color={Colors.green}>
            {totalPoints}
          </BebasText>
          <Text style={styles.statLabel}>Points Earned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
        <Text style={styles.shareButtonText}>Share your code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
    padding: 20,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  copyButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonText: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.cardBorder,
  },
  shareButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReferralBlock;
