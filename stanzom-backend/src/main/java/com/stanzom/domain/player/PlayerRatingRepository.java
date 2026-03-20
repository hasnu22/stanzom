package com.stanzom.domain.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface PlayerRatingRepository extends JpaRepository<PlayerRating, UUID> {

    Optional<PlayerRating> findByPlayerIdAndUserId(UUID playerId, UUID userId);

    @Query("SELECT AVG(pr.overallRating) FROM PlayerRating pr WHERE pr.playerId = :playerId")
    BigDecimal findAverageOverallRatingByPlayerId(@Param("playerId") UUID playerId);
}
