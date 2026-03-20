import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import BebasText from '../ui/BebasText';
import RatingBar from '../ui/RatingBar';

interface RatingCategories {
  skill: number;
  attitude: number;
  clutch: number;
  form: number;
}

interface PlayerRatingsProps {
  ratings: RatingCategories;
  overallRating: number;
  onRate?: (ratings: RatingCategories) => void;
}

const CATEGORIES: { key: keyof RatingCategories; label: string }[] = [
  { key: 'skill', label: 'Skill' },
  { key: 'attitude', label: 'Attitude' },
  { key: 'clutch', label: 'Clutch' },
  { key: 'form', label: 'Form' },
];

const PlayerRatings: React.FC<PlayerRatingsProps> = ({
  ratings,
  overallRating,
  onRate,
}) => {
  const isEditable = !!onRate;

  const handleRate = (category: keyof RatingCategories, value: number) => {
    if (onRate) {
      onRate({ ...ratings, [category]: value });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.overallRow}>
        <BebasText size={20} color={Colors.text}>
          Overall
        </BebasText>
        <BebasText size={28} color={Colors.gold}>
          {overallRating.toFixed(1)}
        </BebasText>
      </View>

      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(ratings[cat.key] / 5) * 100}%` },
                ]}
              />
            </View>
            <RatingBar
              rating={ratings[cat.key]}
              size={16}
              readonly={!isEditable}
              onRate={(val) => handleRate(cat.key, val)}
            />
            <Text style={styles.ratingValue}>
              {ratings[cat.key].toFixed(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  categories: {
    gap: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryLabel: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
    width: 60,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 3,
  },
  ratingValue: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
});

export default PlayerRatings;
