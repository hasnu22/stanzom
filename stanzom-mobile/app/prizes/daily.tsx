import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import api from '../../services/api';
import BebasText from '../../components/ui/BebasText';
import Card from '../../components/ui/Card';

interface AddressForm {
  fullName: string;
  mobileNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export default function DailyPrizeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    fullName: '',
    mobileNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  const prizeQuery = useQuery({
    queryKey: ['prizes', 'daily'],
    queryFn: async () => {
      const { data } = await api.get('/api/prizes/daily');
      return data as any;
    },
  });

  const submitAddressMutation = useMutation({
    mutationFn: async (formData: AddressForm) => {
      const { data } = await api.post('/api/prizes/daily/claim', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prizes', 'daily'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await prizeQuery.refetch();
    setRefreshing(false);
  }, [prizeQuery]);

  const updateField = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    address.fullName.trim().length > 0 &&
    address.mobileNumber.trim().length >= 10 &&
    address.streetAddress.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.pincode.trim().length >= 6;

  if (prizeQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading daily prize...</Text>
      </View>
    );
  }

  if (prizeQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>{'\u26A0\uFE0F'}</Text>
        <BebasText size={22} color={Colors.red}>
          Failed to load prize info
        </BebasText>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const prize = prizeQuery.data;
  const isWinner = prize?.isCurrentUserWinner ?? false;
  const hasSubmittedAddress = prize?.addressSubmitted ?? false;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'\u2190'}</Text>
        </TouchableOpacity>
        <BebasText size={28} color={Colors.gold}>
          DAILY PRIZE
        </BebasText>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Today's Prize Card */}
        <Card style={styles.prizeCard}>
          <Text style={styles.prizeEmoji}>{'\uD83C\uDF81'}</Text>
          <BebasText size={24} color={Colors.gold}>
            Today's Prize
          </BebasText>
          <Text style={styles.prizeName}>{prize?.prizeName ?? 'Daily Prize'}</Text>
          <Text style={styles.prizeDesc}>{prize?.description ?? ''}</Text>
          {prize?.prizeValue && (
            <BebasText size={32} color={Colors.green}>
              {prize.prizeValue}
            </BebasText>
          )}
        </Card>

        {/* Winner Section */}
        {isWinner ? (
          <View style={styles.winnerSection}>
            <View style={styles.congratsCard}>
              <Text style={styles.congratsEmoji}>{'\uD83C\uDF89'}</Text>
              <BebasText size={28} color={Colors.gold}>
                Congratulations!
              </BebasText>
              <Text style={styles.congratsText}>
                You are today's daily prize winner!
              </Text>
            </View>

            {!hasSubmittedAddress ? (
              <View style={styles.formSection}>
                <BebasText size={20} color={Colors.text}>
                  Delivery Address
                </BebasText>
                <Text style={styles.formSubtext}>
                  Please enter your address to claim your prize
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={address.fullName}
                    onChangeText={(v) => updateField('fullName', v)}
                    placeholder="Your full name"
                    placeholderTextColor={Colors.muted}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput
                    style={styles.input}
                    value={address.mobileNumber}
                    onChangeText={(v) => updateField('mobileNumber', v)}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={Colors.muted}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Street Address</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={address.streetAddress}
                    onChangeText={(v) => updateField('streetAddress', v)}
                    placeholder="House no, street, area"
                    placeholderTextColor={Colors.muted}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                      style={styles.input}
                      value={address.city}
                      onChangeText={(v) => updateField('city', v)}
                      placeholder="City"
                      placeholderTextColor={Colors.muted}
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                      style={styles.input}
                      value={address.state}
                      onChangeText={(v) => updateField('state', v)}
                      placeholder="State"
                      placeholderTextColor={Colors.muted}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Pincode</Text>
                  <TextInput
                    style={styles.input}
                    value={address.pincode}
                    onChangeText={(v) => updateField('pincode', v)}
                    placeholder="6-digit pincode"
                    placeholderTextColor={Colors.muted}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !isFormValid && styles.submitBtnDisabled,
                  ]}
                  onPress={() => submitAddressMutation.mutate(address)}
                  disabled={!isFormValid || submitAddressMutation.isPending}
                  activeOpacity={0.7}
                >
                  {submitAddressMutation.isPending ? (
                    <ActivityIndicator color={Colors.bg} size="small" />
                  ) : (
                    <BebasText
                      size={18}
                      color={isFormValid ? Colors.bg : Colors.muted}
                    >
                      Submit Address
                    </BebasText>
                  )}
                </TouchableOpacity>

                {submitAddressMutation.isError && (
                  <Text style={styles.errorText}>
                    Failed to submit. Please try again.
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.submittedCard}>
                <Text style={styles.submittedEmoji}>{'\u2705'}</Text>
                <Text style={styles.submittedText}>
                  Address submitted! Your prize will be delivered soon.
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Not Winner Section */
          <View style={styles.notWinnerSection}>
            {prize?.winner && (
              <Card style={styles.winnerInfoCard}>
                <BebasText size={18} color={Colors.text}>
                  Today's Winner
                </BebasText>
                <View style={styles.winnerRow}>
                  <View style={styles.winnerAvatar}>
                    <Text style={styles.winnerAvatarText}>
                      {(prize.winner.name ?? '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.winnerInfo}>
                    <Text style={styles.winnerName}>
                      {prize.winner.name ?? 'Anonymous'}
                    </Text>
                    <Text style={styles.winnerStats}>
                      {prize.winner.points ?? 0} pts {'\u00B7'}{' '}
                      {prize.winner.accuracy != null
                        ? `${Math.round(prize.winner.accuracy)}% accuracy`
                        : ''}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            <Text style={styles.tipText}>
              Keep predicting and earning points to increase your chances of winning!
            </Text>
          </View>
        )}

        {/* Previous Days' Winners */}
        {(prize?.previousWinners ?? []).length > 0 && (
          <View style={styles.previousSection}>
            <BebasText size={20} color={Colors.text}>
              Previous Winners
            </BebasText>
            {prize.previousWinners.map((pw: any, idx: number) => (
              <View key={pw.id ?? idx} style={styles.previousRow}>
                <View style={styles.previousDate}>
                  <Text style={styles.previousDateText}>
                    {new Date(pw.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <View style={styles.previousInfo}>
                  <Text style={styles.previousName}>
                    {pw.winnerName ?? 'Anonymous'}
                  </Text>
                  <Text style={styles.previousPrize}>{pw.prizeName}</Text>
                </View>
                <Text style={styles.previousPoints}>
                  {pw.points ?? 0} pts
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 12,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  prizeCard: {
    alignItems: 'center',
    borderColor: Colors.gold,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  prizeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  prizeName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  prizeDesc: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  winnerSection: {
    marginBottom: 24,
  },
  congratsCard: {
    backgroundColor: 'rgba(245,166,35,0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  congratsEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  congratsText: {
    color: Colors.text,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 10,
  },
  formSubtext: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 70,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  submitBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: Colors.cardBorder,
  },
  errorText: {
    color: Colors.red,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  submittedCard: {
    backgroundColor: 'rgba(0,230,118,0.1)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  submittedEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  submittedText: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notWinnerSection: {
    marginBottom: 24,
  },
  winnerInfoCard: {
    marginBottom: 16,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  winnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerAvatarText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '700',
  },
  winnerInfo: {
    flex: 1,
  },
  winnerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  winnerStats: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  tipText: {
    color: Colors.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  previousSection: {
    marginBottom: 20,
  },
  previousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  previousDate: {
    width: 50,
    alignItems: 'center',
  },
  previousDateText: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  previousInfo: {
    flex: 1,
  },
  previousName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  previousPrize: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  previousPoints: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
});
