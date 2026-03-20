import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import BebasText from '../ui/BebasText';

interface PredictionQuestion {
  id: string;
  questionText: string;
  correctOptionId?: string;
  options: string;
}

interface UserPredictionItem {
  questionId: string;
  selectedOptionId: string;
  isCorrect?: boolean;
  pointsEarned?: number;
}

interface PredictionResultCardProps {
  card: {
    eventId: string;
    totalPoints: number;
    earnedPoints: number;
    questions: PredictionQuestion[];
    userPredictions: UserPredictionItem[];
  };
}

const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  card,
}) => {
  const accuracy =
    card.questions.length > 0
      ? Math.round(
          (card.userPredictions.filter((p) => p.isCorrect).length /
            card.questions.length) *
            100,
        )
      : 0;

  const getOptionText = (question: PredictionQuestion, optionId: string) => {
    try {
      const options: { id: string; text: string }[] = JSON.parse(
        question.options,
      );
      return options.find((o) => o.id === optionId)?.text ?? optionId;
    } catch {
      return optionId;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <BebasText size={28} color={Colors.text}>
          Your Score: {card.earnedPoints}/{card.totalPoints} PTS
        </BebasText>
        <View
          style={[
            styles.accuracyBadge,
            {
              backgroundColor:
                accuracy >= 50
                  ? 'rgba(0,230,118,0.15)'
                  : 'rgba(255,71,87,0.15)',
            },
          ]}
        >
          <Text
            style={[
              styles.accuracyText,
              { color: accuracy >= 50 ? Colors.green : Colors.red },
            ]}
          >
            {accuracy}%
          </Text>
        </View>
      </View>

      <View style={styles.picks}>
        {card.questions.map((q) => {
          const prediction = card.userPredictions.find(
            (p) => p.questionId === q.id,
          );
          const isCorrect = prediction?.isCorrect ?? false;

          return (
            <View key={q.id} style={styles.pickRow}>
              <Text
                style={[
                  styles.pickIcon,
                  { color: isCorrect ? Colors.green : Colors.red },
                ]}
              >
                {isCorrect ? '\u2713' : '\u2717'}
              </Text>
              <View style={styles.pickInfo}>
                <Text style={styles.pickQuestion} numberOfLines={1}>
                  {q.questionText}
                </Text>
                {prediction && (
                  <Text style={styles.pickAnswer}>
                    Your pick: {getOptionText(q, prediction.selectedOptionId)}
                  </Text>
                )}
              </View>
              {prediction?.pointsEarned !== undefined && (
                <Text
                  style={[
                    styles.pickPoints,
                    { color: isCorrect ? Colors.green : Colors.red },
                  ]}
                >
                  {isCorrect ? '+' : ''}
                  {prediction.pointsEarned}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accuracyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  accuracyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  picks: {
    gap: 10,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  pickIcon: {
    fontSize: 18,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  pickInfo: {
    flex: 1,
  },
  pickQuestion: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  pickAnswer: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  pickPoints: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PredictionResultCard;
