package com.stanzom.domain.sentiment.dto;

import java.util.List;
import java.util.UUID;

public record SentimentMapDto(
        UUID eventId,
        List<SentimentRegionDto> regions
) {
}
