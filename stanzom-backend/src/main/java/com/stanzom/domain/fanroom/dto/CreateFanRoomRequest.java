package com.stanzom.domain.fanroom.dto;

import java.util.UUID;

public record CreateFanRoomRequest(
        String name,
        UUID eventId,
        UUID sportId,
        String accessType
) {
}
