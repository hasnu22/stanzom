package com.stanzom.domain.fanroom.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FanRoomMemberDto(
        UUID id,
        UUID userId,
        String userName,
        String role,
        OffsetDateTime joinedAt
) {
}
