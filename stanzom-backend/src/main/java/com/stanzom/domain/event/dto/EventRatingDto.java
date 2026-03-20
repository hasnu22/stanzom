package com.stanzom.domain.event.dto;

import java.math.BigDecimal;

public record EventRatingDto(
        BigDecimal averageRating,
        int totalRatings,
        BigDecimal userRating
) {
}
