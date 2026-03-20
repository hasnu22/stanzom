package com.stanzom.domain.sport.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TournamentDto(
        UUID id,
        UUID sportId,
        String sportName,
        String name,
        String slug,
        String season,
        LocalDate startDate,
        LocalDate endDate,
        String logoUrl,
        boolean isActive,
        OffsetDateTime createdAt
) {
}
