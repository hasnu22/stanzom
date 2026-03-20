package com.stanzom.domain.fanroom.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FanRoomDto(
        UUID id,
        String name,
        UUID createdBy,
        UUID eventId,
        UUID sportId,
        String inviteCode,
        String accessType,
        boolean isActive,
        OffsetDateTime createdAt,
        int memberCount
) {
}
