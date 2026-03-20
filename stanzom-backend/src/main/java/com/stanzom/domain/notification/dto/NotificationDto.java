package com.stanzom.domain.notification.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationDto(
        UUID id,
        String title,
        String message,
        String type,
        String referenceId,
        boolean isRead,
        OffsetDateTime createdAt
) {
}
