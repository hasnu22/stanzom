package com.stanzom.domain.sentiment.dto;

import java.util.Map;
import java.util.UUID;

public record SentimentSummaryDto(
        UUID eventId,
        long totalVotes,
        Map<UUID, Long> teamVotes,
        UUID userVotedTeamId
) {
}
