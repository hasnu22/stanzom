package com.stanzom.domain.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EventReactionRepository extends JpaRepository<EventReaction, UUID> {

    List<EventReaction> findByEventId(UUID eventId);

    @Query("SELECT r.emoji, COUNT(r) FROM EventReaction r WHERE r.eventId = :eventId GROUP BY r.emoji")
    List<Object[]> getEmojiCountsByEventId(@Param("eventId") UUID eventId);
}
