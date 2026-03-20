package com.stanzom.domain.player.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PlayerDetailDto(
        UUID id,
        UUID sportId,
        String name,
        UUID teamId,
        String role,
        String country,
        Integer jerseyNumber,
        int followersCount,
        int likesCount,
        BigDecimal overallRating,
        int ratingCount,
        String bio,
        String imageUrl,
        String stats,
        boolean isActive,
        String teamName,
        String sportName,
        BigDecimal averageRating,
        BigDecimal userRating
) {
}
