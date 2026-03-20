package com.stanzom.domain.team.dto;

import java.math.BigDecimal;

public record RateTeamRequest(
        String ratings,
        BigDecimal overallRating,
        String reviewText
) {
}
