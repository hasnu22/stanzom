package com.stanzom.domain.event.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record EventDetailDto(
        UUID id,
        UUID sportId,
        String sportName,
        UUID tournamentId,
        String tournamentName,
        String eventType,
        String title,
        UUID teamHomeId,
        UUID teamAwayId,
        OffsetDateTime eventDate,
        String venue,
        String status,
        String scoreHome,
        String scoreAway,
        UUID winnerTeamId,
        String metadata,
        String currentPeriod,
        OffsetDateTime createdAt,
        BigDecimal averageRating,
        List<ReactionSummaryDto> reactionsSummary
) {
}
