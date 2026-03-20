package com.stanzom.domain.sport.dto;

import java.util.UUID;

public record SportDto(
        UUID id,
        String name,
        String slug,
        String iconUrl,
        boolean isActive,
        int displayOrder
) {
}
