package com.stanzom.domain.event.dto;

public record ReactionSummaryDto(
        String emoji,
        long count
) {
}
