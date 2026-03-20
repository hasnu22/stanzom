package com.stanzom.domain.prediction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, UUID> {

    Optional<PollVote> findByPollIdAndUserId(UUID pollId, UUID userId);

    @Query("SELECT pv.optionId, COUNT(pv) FROM PollVote pv WHERE pv.pollId = :pollId GROUP BY pv.optionId")
    List<Object[]> countVotesGroupedByOptionId(@Param("pollId") UUID pollId);
}
