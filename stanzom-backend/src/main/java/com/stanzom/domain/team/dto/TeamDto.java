package com.stanzom.domain.team.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TeamDto(
        UUID id,
        UUID sportId,
        UUID tournamentId,
        String shortName,
        String fullName,
        String city,
        String homeGround,
        String primaryColor,
        String secondaryColor,
        String logoUrl,
        int followersCount,
        BigDecimal overallRating,
        int ratingCount,
        Integer foundedYear,
        int titles,
        String sportName
) {
}
