package com.stanzom.domain.event.dto;

import java.util.UUID;

public record UpdateEventRequest(
        String status,
        String scoreHome,
        String scoreAway,
        UUID winnerTeamId,
        String currentPeriod,
        String metadata
) {
}
