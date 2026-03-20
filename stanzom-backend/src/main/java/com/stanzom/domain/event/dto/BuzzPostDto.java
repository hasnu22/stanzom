package com.stanzom.domain.event.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record BuzzPostDto(
        UUID id,
        UUID eventId,
        UUID userId,
        String userName,
        String content,
        String postType,
        String eventMoment,
        int likesCount,
        OffsetDateTime createdAt
) {
}
