package com.stanzom.domain.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface EventRatingRepository extends JpaRepository<EventRating, UUID> {

    Optional<EventRating> findByEventIdAndUserId(UUID eventId, UUID userId);

    @Query("SELECT AVG(r.rating) FROM EventRating r WHERE r.eventId = :eventId")
    BigDecimal getAverageRatingByEventId(@Param("eventId") UUID eventId);

    @Query("SELECT COUNT(r) FROM EventRating r WHERE r.eventId = :eventId")
    int countByEventId(@Param("eventId") UUID eventId);
}
