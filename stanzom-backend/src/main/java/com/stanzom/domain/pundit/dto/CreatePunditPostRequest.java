package com.stanzom.domain.pundit.dto;

import java.util.UUID;

public record CreatePunditPostRequest(
        UUID eventId,
        UUID sportId,
        String takeText,
        String audienceType
) {
}
