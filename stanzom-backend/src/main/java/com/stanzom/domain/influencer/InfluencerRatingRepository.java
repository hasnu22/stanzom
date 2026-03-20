package com.stanzom.domain.influencer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface InfluencerRatingRepository extends JpaRepository<InfluencerRating, UUID> {

    Optional<InfluencerRating> findByInfluencerIdAndUserId(UUID influencerId, UUID userId);

    @Query("SELECT AVG(r.rating) FROM InfluencerRating r WHERE r.influencerId = :influencerId")
    BigDecimal findAverageRatingByInfluencerId(@Param("influencerId") UUID influencerId);

    long countByInfluencerId(UUID influencerId);
}
