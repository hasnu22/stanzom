package com.stanzom.domain.sentiment.dto;

import java.util.UUID;

public record SentimentRegionDto(
        String city,
        String state,
        UUID teamId,
        long voteCount
) {
}
