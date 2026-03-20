package com.stanzom.domain.prediction;

import com.stanzom.domain.prediction.dto.*;
import com.stanzom.domain.user.User;
import com.stanzom.domain.user.UserRepository;
import com.stanzom.shared.BadRequestException;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Transactional
public class PredictionService {

    private final PredictionQuestionRepository questionRepository;
    private final UserPredictionRepository userPredictionRepository;
    private final UserRepository userRepository;
    private final PredictionMapper predictionMapper;

    @Transactional(readOnly = true)
    public List<PredictionQuestionDto> getQuestions(UUID eventId) {
        List<PredictionQuestion> questions = questionRepository.findByEventIdAndIsActiveTrue(eventId);
        return predictionMapper.toQuestionDtoList(questions);
    }

    public UserPredictionDto answerQuestion(UUID userId, UUID questionId, AnswerPredictionRequest request) {
        PredictionQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("PredictionQuestion", "id", questionId));

        if (question.getLockTime() != null && OffsetDateTime.now().isAfter(question.getLockTime())) {
            throw new BadRequestException("Predictions are locked for this question");
        }

        userPredictionRepository.findByUserIdAndQuestionId(userId, questionId)
                .ifPresent(existing -> {
                    throw new BadRequestException("You have already answered this question");
                });

        UserPrediction prediction = UserPrediction.builder()
                .userId(userId)
                .questionId(questionId)
                .eventId(question.getEventId())
                .selectedOptionId(request.selectedOptionId())
                .isLocked(false)
                .pointsEarned(0)
                .build();

        UserPrediction saved = userPredictionRepository.save(prediction);
        return predictionMapper.toUserPredictionDto(saved);
    }

    public UserPredictionDto lockPrediction(UUID userId, UUID questionId) {
        UserPrediction prediction = userPredictionRepository.findByUserIdAndQuestionId(userId, questionId)
                .orElseThrow(() -> new ResourceNotFoundException("UserPrediction", "questionId", questionId));

        if (prediction.isLocked()) {
            throw new BadRequestException("Prediction is already locked");
        }

        prediction.setLocked(true);
        prediction.setLockedAt(OffsetDateTime.now());

        UserPrediction saved = userPredictionRepository.save(prediction);
        return predictionMapper.toUserPredictionDto(saved);
    }

    @Transactional(readOnly = true)
    public PredictionCardDto getPredictionCard(UUID userId, UUID eventId) {
        List<PredictionQuestion> questions = questionRepository.findByEventIdAndIsActiveTrue(eventId);
        List<UserPrediction> userPredictions = userPredictionRepository.findByUserIdAndEventId(userId, eventId);

        int totalPoints = questions.stream().mapToInt(PredictionQuestion::getPoints).sum();
        int earnedPoints = userPredictions.stream().mapToInt(UserPrediction::getPointsEarned).sum();

        return new PredictionCardDto(
                eventId,
                predictionMapper.toQuestionDtoList(questions),
                predictionMapper.toUserPredictionDtoList(userPredictions),
                totalPoints,
                earnedPoints
        );
    }

    public void resolveQuestion(UUID questionId, ResolvePredictionRequest request) {
        PredictionQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("PredictionQuestion", "id", questionId));

        question.setCorrectOptionId(request.correctOptionId());
        questionRepository.save(question);

        List<UserPrediction> predictions = userPredictionRepository.findByQuestionId(questionId);

        for (UserPrediction prediction : predictions) {
            boolean correct = request.correctOptionId().equals(prediction.getSelectedOptionId());
            prediction.setIsCorrect(correct);
            prediction.setPointsEarned(correct ? question.getPoints() : 0);
            userPredictionRepository.save(prediction);

            // Update user season_points
            User user = userRepository.findById(prediction.getUserId()).orElse(null);
            if (user != null && correct) {
                user.setSeasonPoints(user.getSeasonPoints() + question.getPoints());

                // Update season accuracy
                long totalPredictions = userPredictionRepository.countByUserId(prediction.getUserId());
                long correctPredictions = userPredictionRepository.countByUserIdAndIsCorrectTrue(prediction.getUserId());
                if (totalPredictions > 0) {
                    BigDecimal accuracy = BigDecimal.valueOf(correctPredictions)
                            .multiply(BigDecimal.valueOf(100))
                            .divide(BigDecimal.valueOf(totalPredictions), 2, RoundingMode.HALF_UP);
                    user.setSeasonAccuracy(accuracy);
                }

                userRepository.save(user);
            }
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "#scope + '_' + #city + '_' + #state + '_' + #sportSlug")
    public List<LeaderboardEntryDto> getLeaderboard(String scope, String city, String state, String sportSlug, Pageable pageable) {
        Page<User> usersPage;

        switch (scope != null ? scope.toUpperCase() : "GLOBAL") {
            case "CITY" -> {
                if (city == null || city.isBlank()) {
                    throw new BadRequestException("City is required for CITY scope");
                }
                usersPage = userRepository.findTopUsersBySeasonPointsInCity(city, pageable);
            }
            case "STATE" -> {
                if (state == null || state.isBlank()) {
                    throw new BadRequestException("State is required for STATE scope");
                }
                usersPage = userRepository.findTopUsersBySeasonPointsInState(state, pageable);
            }
            default -> usersPage = userRepository.findTopUsersBySeasonPoints(pageable);
        }

        AtomicInteger rankCounter = new AtomicInteger(pageable.getPageNumber() * pageable.getPageSize() + 1);

        return usersPage.getContent().stream()
                .map(user -> new LeaderboardEntryDto(
                        user.getId(),
                        user.getName(),
                        user.getUsername(),
                        user.getProfileImageUrl(),
                        user.getSeasonPoints(),
                        user.getSeasonAccuracy(),
                        rankCounter.getAndIncrement()
                ))
                .toList();
    }
}
