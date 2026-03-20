import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function VerifyScreen() {
  const { mobileNumber, devOtp } = useLocalSearchParams<{ mobileNumber: string; devOtp?: string }>();
  const { verifyOtp, sendOtp } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-submit when all digits entered
  const handleOtpChange = useCallback(
    async (value: string, index: number) => {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when complete
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH && !newOtp.includes('')) {
        await submitOtp(fullOtp);
      }
    },
    [otp, mobileNumber],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const submitOtp = async (otpString: string) => {
    if (!mobileNumber) return;

    setLoading(true);
    setError('');

    try {
      await verifyOtp(mobileNumber, otpString);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err?.message || 'Invalid OTP. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !mobileNumber) return;

    try {
      await sendOtp(mobileNumber);
      setResendTimer(RESEND_COOLDOWN);
      setError('');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.message || 'Failed to resend OTP.');
    }
  };

  const maskedNumber = mobileNumber
    ? mobileNumber.slice(0, 2) + 'XXXXXX' + mobileNumber.slice(-2)
    : '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to +91 {maskedNumber}
        </Text>
        {devOtp ? (
          <Text style={styles.devOtp}>DEV OTP: {devOtp}</Text>
        ) : null}

        <View style={styles.otpRow}>
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                otp[index] ? styles.otpBoxFilled : null,
                error ? styles.otpBoxError : null,
              ]}
              value={otp[index]}
              onChangeText={(value) =>
                handleOtpChange(value.replace(/[^0-9]/g, '').slice(-1), index)
              }
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="numeric"
              maxLength={1}
              autoFocus={index === 0}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading && (
          <ActivityIndicator
            size="small"
            color={Colors.gold}
            style={styles.loader}
          />
        )}

        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={resendTimer > 0}
          style={styles.resendButton}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.resendText,
              resendTimer > 0 && styles.resendTextDisabled,
            ]}
          >
            {resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: Colors.muted,
    marginBottom: 40,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    textAlign: 'center',
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    color: Colors.text,
  },
  otpBoxFilled: {
    borderColor: Colors.gold,
  },
  otpBoxError: {
    borderColor: Colors.red,
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Colors.red,
    marginTop: 8,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  resendButton: {
    marginTop: 32,
    padding: 8,
  },
  resendText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Colors.gold,
  },
  resendTextDisabled: {
    color: Colors.muted,
  },
  devOtp: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: Colors.green,
    marginBottom: 20,
    letterSpacing: 4,
  },
});
