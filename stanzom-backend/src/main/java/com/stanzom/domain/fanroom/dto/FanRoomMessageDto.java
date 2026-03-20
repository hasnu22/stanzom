package com.stanzom.domain.fanroom.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FanRoomMessageDto(
        UUID id,
        UUID userId,
        String userName,
        String content,
        String messageType,
        OffsetDateTime createdAt
) {
}
