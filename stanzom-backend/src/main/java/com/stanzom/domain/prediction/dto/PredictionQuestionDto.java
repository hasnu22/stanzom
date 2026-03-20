package com.stanzom.domain.prediction.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PredictionQuestionDto(
        UUID id,
        UUID eventId,
        String questionText,
        String questionType,
        int points,
        String options,
        String correctOptionId,
        boolean isActive,
        OffsetDateTime lockTime
) {
}
