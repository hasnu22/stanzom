package com.stanzom.domain.influencer.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record InfluencerApplicationDto(
        UUID id,
        UUID userId,
        String[] niche,
        UUID[] sports,
        String bio,
        String socialHandle,
        String status,
        UUID reviewedBy,
        OffsetDateTime reviewedAt,
        OffsetDateTime createdAt
) {
}
