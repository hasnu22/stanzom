package com.stanzom.domain.fanroom.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FanRoomInviteDto(
        UUID id,
        UUID roomId,
        UUID invitedBy,
        UUID invitedUserId,
        String mobileNumber,
        String status,
        OffsetDateTime createdAt
) {
}
