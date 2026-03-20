package com.stanzom.domain.prediction.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record LeaderboardEntryDto(
        UUID userId,
        String name,
        String username,
        String profileImageUrl,
        int seasonPoints,
        BigDecimal seasonAccuracy,
        int rank
) {
}
