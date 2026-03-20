package com.stanzom.domain.prediction.dto;

import java.util.List;
import java.util.UUID;

public record PredictionCardDto(
        UUID eventId,
        List<PredictionQuestionDto> questions,
        List<UserPredictionDto> userPredictions,
        int totalPoints,
        int earnedPoints
) {
}
