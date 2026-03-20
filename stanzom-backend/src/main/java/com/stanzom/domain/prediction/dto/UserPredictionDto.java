package com.stanzom.domain.prediction.dto;

import java.util.UUID;

public record UserPredictionDto(
        UUID id,
        UUID questionId,
        String selectedOptionId,
        boolean isLocked,
        Boolean isCorrect,
        int pointsEarned
) {
}
