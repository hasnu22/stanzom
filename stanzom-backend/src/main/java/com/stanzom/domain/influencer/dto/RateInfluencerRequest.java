package com.stanzom.domain.influencer.dto;

import java.math.BigDecimal;

public record RateInfluencerRequest(
        BigDecimal rating,
        String reviewText
) {
}
