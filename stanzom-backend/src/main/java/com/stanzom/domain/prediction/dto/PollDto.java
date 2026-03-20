package com.stanzom.domain.prediction.dto;

import java.util.UUID;

public record PollDto(
        UUID id,
        UUID eventId,
        String question,
        String options,
        String sponsorName,
        boolean isActive
) {
}
