import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

export default function AuthSplashScreen() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendOtp } = useAuth();

  const handleSendOtp = async () => {
    if (mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await sendOtp(mobileNumber);
      // DEV: extract OTP from message if present
      const devOtp = result?.message?.match(/Dev OTP: (\d{6})/)?.[1] || '';
      router.push({
        pathname: '/(auth)/verify',
        params: { mobileNumber, devOtp },
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" translucent />

      <View style={styles.brandingSection}>
        <Text style={styles.brandName}>STANZOM</Text>
        <Text style={styles.tagline}>Your Game. Your Call. Your Stage.</Text>
        <Text style={styles.sportEmojis}>
          {'\u{1F3CF}'}{'  '}{'\u26BD'}{'  '}{'\u{1F93C}'}{'  '}{'\u{1F3BE}'}{'  '}{'\u{1F3C0}'}
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Enter your mobile number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text.replace(/[^0-9]/g, ''));
              setError('');
            }}
            placeholder="Mobile number"
            placeholderTextColor={Colors.muted}
            keyboardType="numeric"
            maxLength={10}
            autoFocus={false}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.sendOtpButton,
            (loading || mobileNumber.length !== 10) && styles.sendOtpButtonDisabled,
          ]}
          onPress={handleSendOtp}
          disabled={loading || mobileNumber.length !== 10}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.bg} />
          ) : (
            <Text style={styles.sendOtpText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  brandName: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    color: Colors.gold,
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: Colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  sportEmojis: {
    fontSize: 28,
    marginTop: 24,
    letterSpacing: 4,
  },
  inputSection: {
    width: '100%',
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryCode: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.red,
    marginTop: 8,
  },
  sendOtpButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
  },
  sendOtpButtonDisabled: {
    opacity: 0.5,
  },
  sendOtpText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: Colors.bg,
  },
});
