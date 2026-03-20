package com.stanzom.domain.sentiment.dto;

import java.util.UUID;

public record SentimentVoteRequest(
        UUID teamId
) {
}
