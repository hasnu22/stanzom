package com.stanzom.domain.user.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record UserDto(
        UUID id,
        String mobileNumber,
        String name,
        String username,
        String city,
        String state,
        String country,
        String profileImageUrl,
        UUID favoriteTeamId,
        UUID favoriteSportId,
        int seasonPoints,
        BigDecimal seasonAccuracy,
        int activeDays,
        String referralCode,
        UUID referredBy,
        Boolean isInfluencer,
        Boolean influencerVerified,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
