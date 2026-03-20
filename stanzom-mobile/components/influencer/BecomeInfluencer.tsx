import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';
import BebasText from '../ui/BebasText';

interface BecomeInfluencerData {
  bio: string;
  socialHandle: string;
  niches: string[];
  sports: string[];
}

interface BecomeInfluencerProps {
  onSubmit: (data: BecomeInfluencerData) => void;
}

const NICHE_OPTIONS = [
  'Cricket',
  'Football',
  'Basketball',
  'Tennis',
  'Esports',
  'Fantasy',
  'Betting',
  'Fitness',
];

const SPORT_OPTIONS = [
  'Cricket',
  'Football',
  'Basketball',
  'Tennis',
  'Baseball',
  'Hockey',
  'Kabaddi',
  'MMA',
];

const BecomeInfluencer: React.FC<BecomeInfluencerProps> = ({ onSubmit }) => {
  const [bio, setBio] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const toggleChip = (
    item: string,
    selected: string[],
    setSelected: (val: string[]) => void,
  ) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((s) => s !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      bio,
      socialHandle,
      niches: selectedNiches,
      sports: selectedSports,
    });
  };

  const isValid =
    bio.trim().length > 0 &&
    socialHandle.trim().length > 0 &&
    selectedNiches.length > 0 &&
    selectedSports.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <BebasText size={28} color={Colors.gold}>
        Become an Influencer
      </BebasText>
      <Text style={styles.subtitle}>
        Share your sports knowledge with the community
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          placeholderTextColor={Colors.muted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Social Handle</Text>
        <TextInput
          style={styles.input}
          value={socialHandle}
          onChangeText={setSocialHandle}
          placeholder="@yourhandle"
          placeholderTextColor={Colors.muted}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Niche</Text>
        <View style={styles.chipContainer}>
          {NICHE_OPTIONS.map((niche) => {
            const isSelected = selectedNiches.includes(niche);
            return (
              <TouchableOpacity
                key={niche}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() =>
                  toggleChip(niche, selectedNiches, setSelectedNiches)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {niche}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Sports</Text>
        <View style={styles.chipContainer}>
          {SPORT_OPTIONS.map((sport) => {
            const isSelected = selectedSports.includes(sport);
            return (
              <TouchableOpacity
                key={sport}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() =>
                  toggleChip(sport, selectedSports, setSelectedSports)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isValid}
        activeOpacity={0.7}
      >
        <BebasText size={20} color={isValid ? Colors.bg : Colors.muted}>
          Submit Application
        </BebasText>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
    minHeight: 100,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  chipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.bg,
  },
  submitButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.cardBorder,
  },
});

export default BecomeInfluencer;
