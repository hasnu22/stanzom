package com.stanzom.domain.pundit.dto;

import java.util.UUID;

public record PunditPostPickDto(
        UUID id,
        String questionText,
        String userAnswer,
        String correctAnswer,
        Boolean isCorrect,
        int pointsEarned
) {
}
