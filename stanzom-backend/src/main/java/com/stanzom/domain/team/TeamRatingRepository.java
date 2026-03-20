package com.stanzom.domain.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface TeamRatingRepository extends JpaRepository<TeamRating, UUID> {

    Optional<TeamRating> findByTeamIdAndUserId(UUID teamId, UUID userId);

    @Query("SELECT AVG(tr.overallRating) FROM TeamRating tr WHERE tr.teamId = :teamId")
    BigDecimal findAverageOverallRatingByTeamId(@Param("teamId") UUID teamId);
}
