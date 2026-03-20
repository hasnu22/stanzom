package com.stanzom.domain.player.dto;

import java.math.BigDecimal;

public record RatePlayerRequest(
        String ratings,
        BigDecimal overallRating,
        String reviewText
) {
}
