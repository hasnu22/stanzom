package com.stanzom.scheduler;

import com.stanzom.domain.event.Event;
import com.stanzom.domain.event.EventRepository;
import com.stanzom.domain.prediction.PredictionQuestion;
import com.stanzom.domain.prediction.PredictionQuestionRepository;
import com.stanzom.domain.prediction.UserPrediction;
import com.stanzom.domain.prediction.UserPredictionRepository;
import com.stanzom.domain.user.User;
import com.stanzom.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class PredictionResolutionScheduler {

    private final EventRepository eventRepository;
    private final PredictionQuestionRepository predictionQuestionRepository;
    private final UserPredictionRepository userPredictionRepository;
    private final UserRepository userRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void resolveCompletedEvents() {
        List<Event> completedEvents = eventRepository.findByStatus("COMPLETED");

        for (Event event : completedEvents) {
            List<PredictionQuestion> questions = predictionQuestionRepository.findByEventId(event.getId());

            for (PredictionQuestion question : questions) {
                // Skip already resolved questions
                if (question.getCorrectOptionId() != null) {
                    continue;
                }

                // Auto-resolve EVENT_WINNER type questions based on winner_team_id
                if ("EVENT_WINNER".equals(question.getQuestionType()) && event.getWinnerTeamId() != null) {
                    String correctOptionId = determineCorrectOptionForWinner(question, event.getWinnerTeamId());

                    if (correctOptionId == null) {
                        log.warn("Could not determine correct option for EVENT_WINNER question {} in event {}",
                                question.getId(), event.getId());
                        continue;
                    }

                    question.setCorrectOptionId(correctOptionId);
                    predictionQuestionRepository.save(question);

                    // Resolve all user predictions for this question
                    resolveUserPredictions(question);

                    log.info("Auto-resolved EVENT_WINNER question {} for event {} with correct option {}",
                            question.getId(), event.getId(), correctOptionId);
                } else {
                    log.info("Question {} for event {} requires manual resolution (type: {}, correct_option_id: null)",
                            question.getId(), event.getId(), question.getQuestionType());
                }
            }
        }
    }

    private String determineCorrectOptionForWinner(PredictionQuestion question, UUID winnerTeamId) {
        // The options JSON contains option objects with team IDs
        // For EVENT_WINNER questions, the correct option corresponds to the winning team
        // Option IDs typically map as: "A" for home team, "B" for away team
        // This logic should be adapted based on the actual options JSON structure
        String options = question.getOptions();
        if (options == null) {
            return null;
        }

        // Simple heuristic: if the options JSON contains the winner team ID,
        // find which option ID corresponds to it
        if (options.contains(winnerTeamId.toString())) {
            // Parse to find the matching option ID
            // Options format expected: [{"id":"A","text":"Team X","teamId":"uuid"}, ...]
            if (options.indexOf(winnerTeamId.toString()) < options.indexOf("\"id\":\"B\"")
                    || !options.contains("\"id\":\"B\"")) {
                return "A";
            } else {
                return "B";
            }
        }

        return null;
    }

    private void resolveUserPredictions(PredictionQuestion question) {
        List<UserPrediction> predictions = userPredictionRepository.findByQuestionId(question.getId());

        for (UserPrediction prediction : predictions) {
            boolean isCorrect = question.getCorrectOptionId().equals(prediction.getSelectedOptionId());
            int pointsEarned = isCorrect ? question.getPoints() : 0;

            prediction.setIsCorrect(isCorrect);
            prediction.setPointsEarned(pointsEarned);
            userPredictionRepository.save(prediction);

            // Update user season points and accuracy
            updateUserStats(prediction.getUserId());
        }
    }

    private void updateUserStats(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User not found for stats update: {}", userId);
            return;
        }

        // Recalculate season points
        Integer totalPoints = userPredictionRepository.sumPointsEarnedByUserId(userId);
        user.setSeasonPoints(totalPoints != null ? totalPoints : 0);

        // Recalculate season accuracy
        long correctCount = userPredictionRepository.countByUserIdAndIsCorrectTrue(userId);
        long totalCount = userPredictionRepository.countByUserId(userId);

        if (totalCount > 0) {
            BigDecimal accuracy = BigDecimal.valueOf(correctCount)
                    .divide(BigDecimal.valueOf(totalCount), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
            user.setSeasonAccuracy(accuracy);
        }

        userRepository.save(user);
        log.debug("Updated stats for user {}: seasonPoints={}, seasonAccuracy={}",
                userId, user.getSeasonPoints(), user.getSeasonAccuracy());
    }
}
