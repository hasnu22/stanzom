package com.stanzom.domain.prize.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DailyPrizeDto(
        UUID id,
        UUID eventId,
        UUID sportId,
        UUID winnerUserId,
        String winnerName,
        Integer pointsScored,
        BigDecimal predictionAccuracy,
        String prizeDescription,
        String status,
        LocalDate prizeDate
) {
}
