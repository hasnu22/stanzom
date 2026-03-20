package com.stanzom.domain.user.dto;

import java.math.BigDecimal;

public record UserStatsDto(
        int seasonPoints,
        BigDecimal seasonAccuracy,
        int activeDays,
        long totalPredictions,
        long correctPredictions,
        long rank
) {
}
