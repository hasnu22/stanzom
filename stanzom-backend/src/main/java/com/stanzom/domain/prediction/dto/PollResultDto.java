package com.stanzom.domain.prediction.dto;

import java.util.Map;
import java.util.UUID;

public record PollResultDto(
        UUID pollId,
        Map<String, Long> voteCounts,
        String userVotedOptionId,
        long totalVotes
) {
}
