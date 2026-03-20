package com.stanzom.domain.team.dto;

import com.stanzom.domain.player.dto.PlayerDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TeamDetailDto(
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
        String sportName,
        BigDecimal averageRating,
        BigDecimal userRating,
        List<PlayerDto> squad
) {
}
