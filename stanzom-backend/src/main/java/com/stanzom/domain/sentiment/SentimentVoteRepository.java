package com.stanzom.domain.sentiment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SentimentVoteRepository extends JpaRepository<SentimentVote, UUID> {

    Optional<SentimentVote> findByEventIdAndUserId(UUID eventId, UUID userId);

    @Query("SELECT s.teamId, COUNT(s) FROM SentimentVote s WHERE s.eventId = :eventId GROUP BY s.teamId")
    List<Object[]> countVotesGroupedByTeam(@Param("eventId") UUID eventId);

    @Query("SELECT s.teamId, s.city, COUNT(s) FROM SentimentVote s WHERE s.eventId = :eventId GROUP BY s.teamId, s.city")
    List<Object[]> countVotesGroupedByTeamAndCity(@Param("eventId") UUID eventId);

    @Query("SELECT s.teamId, s.state, COUNT(s) FROM SentimentVote s WHERE s.eventId = :eventId GROUP BY s.teamId, s.state")
    List<Object[]> countVotesGroupedByTeamAndState(@Param("eventId") UUID eventId);

    long countByEventId(UUID eventId);
}
