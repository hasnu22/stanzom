import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import BebasText from '../ui/BebasText';
import Badge from '../ui/Badge';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
  options: string;
  correctOptionId?: string;
  isActive: boolean;
  lockTime: string;
}

interface UserPrediction {
  selectedOptionId: string;
  isLocked: boolean;
  isCorrect?: boolean;
  pointsEarned?: number;
}

interface QuestionCardProps {
  question: Question;
  userPrediction?: UserPrediction;
  onAnswer: (questionId: string, optionId: string) => void;
  onLock: (questionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  userPrediction,
  onAnswer,
  onLock,
}) => {
  const options: Option[] = useMemo(() => {
    try {
      return JSON.parse(question.options);
    } catch {
      return [];
    }
  }, [question.options]);

  const isResolved = !!question.correctOptionId;
  const isLocked = userPrediction?.isLocked ?? false;
  const selectedId = userPrediction?.selectedOptionId;

  const getCountdown = () => {
    const lockTime = new Date(question.lockTime).getTime();
    const now = Date.now();
    const diff = lockTime - now;
    if (diff <= 0) return 'Locked';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (mins > 60) {
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const getOptionStyle = (optionId: string) => {
    if (isResolved) {
      if (optionId === question.correctOptionId) {
        return styles.optionCorrect;
      }
      if (optionId === selectedId && optionId !== question.correctOptionId) {
        return styles.optionWrong;
      }
    }
    if (optionId === selectedId) {
      return styles.optionSelected;
    }
    return styles.optionDefault;
  };

  const getOptionTextStyle = (optionId: string) => {
    if (isResolved && optionId === question.correctOptionId) {
      return styles.optionTextCorrect;
    }
    if (
      isResolved &&
      optionId === selectedId &&
      optionId !== question.correctOptionId
    ) {
      return styles.optionTextWrong;
    }
    if (optionId === selectedId) {
      return styles.optionTextSelected;
    }
    return styles.optionTextDefault;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.questionText}>{question.questionText}</Text>
        <Badge label={`${question.points} PTS`} color={Colors.gold} size="sm" />
      </View>

      <View style={styles.options}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.option, getOptionStyle(opt.id)]}
            onPress={() => {
              if (!isLocked && !isResolved && question.isActive) {
                onAnswer(question.id, opt.id);
              }
            }}
            activeOpacity={isLocked || isResolved ? 1 : 0.7}
            disabled={isLocked || isResolved || !question.isActive}
          >
            <Text style={getOptionTextStyle(opt.id)}>{opt.text}</Text>
            {isResolved && opt.id === question.correctOptionId && (
              <Text style={styles.checkMark}>{'\u2713'}</Text>
            )}
            {isResolved &&
              opt.id === selectedId &&
              opt.id !== question.correctOptionId && (
                <Text style={styles.crossMark}>{'\u2717'}</Text>
              )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        {!isResolved && !isLocked && selectedId && question.isActive && (
          <TouchableOpacity
            style={styles.lockButton}
            onPress={() => onLock(question.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.lockButtonText}>
              {'\uD83D\uDD12'} LOCK IN
            </Text>
          </TouchableOpacity>
        )}

        {isLocked && !isResolved && (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>
              {'\uD83D\uDD12'} Locked
            </Text>
          </View>
        )}

        {question.isActive && !isResolved && (
          <Text style={styles.countdown}>{getCountdown()}</Text>
        )}

        {isResolved && userPrediction?.pointsEarned !== undefined && (
          <Text
            style={[
              styles.pointsEarned,
              {
                color: userPrediction.isCorrect ? Colors.green : Colors.red,
              },
            ]}
          >
            {userPrediction.isCorrect ? '+' : ''}
            {userPrediction.pointsEarned} PTS
          </Text>
        )}
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
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  questionText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 21,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionDefault: {
    borderColor: Colors.cardBorder,
    backgroundColor: 'transparent',
  },
  optionSelected: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(245,166,35,0.1)',
  },
  optionCorrect: {
    borderColor: Colors.green,
    backgroundColor: 'rgba(0,230,118,0.1)',
  },
  optionWrong: {
    borderColor: Colors.red,
    backgroundColor: 'rgba(255,71,87,0.1)',
  },
  optionTextDefault: {
    color: Colors.text,
    fontSize: 14,
  },
  optionTextSelected: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '600',
  },
  optionTextWrong: {
    color: Colors.red,
    fontSize: 14,
    fontWeight: '600',
  },
  checkMark: {
    color: Colors.green,
    fontSize: 18,
    fontWeight: '700',
  },
  crossMark: {
    color: Colors.red,
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  lockButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  lockButtonText: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  lockedBadge: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lockedText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  countdown: {
    color: Colors.muted,
    fontSize: 13,
    marginLeft: 'auto',
  },
  pointsEarned: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    marginLeft: 'auto',
  },
});

export default QuestionCard;
