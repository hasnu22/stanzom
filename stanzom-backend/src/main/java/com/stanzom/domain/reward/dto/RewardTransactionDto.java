package com.stanzom.domain.reward.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record RewardTransactionDto(
        UUID id,
        int points,
        String transactionType,
        String description,
        String referenceId,
        OffsetDateTime createdAt
) {
}
