package com.stanzom.domain.influencer.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record InfluencerDetailDto(
        UUID id,
        UUID userId,
        String displayName,
        String handle,
        String bio,
        UUID[] sports,
        String[] niche,
        String platform,
        String followersCount,
        String socialUrl,
        boolean isVerified,
        boolean isFeatured,
        Integer featuredOrder,
        int likesCount,
        BigDecimal overallRating,
        int ratingCount,
        OffsetDateTime createdAt,
        BigDecimal userRating
) {
}
