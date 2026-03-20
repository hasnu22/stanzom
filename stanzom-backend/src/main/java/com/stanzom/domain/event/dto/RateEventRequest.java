package com.stanzom.domain.event.dto;

import java.math.BigDecimal;

public record RateEventRequest(
        BigDecimal rating,
        String reviewText
) {
}
