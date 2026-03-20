package com.stanzom.domain.reward.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ReferralDto(
        UUID id,
        UUID referredId,
        String referredName,
        int pointsAwarded,
        OffsetDateTime createdAt
) {
}
