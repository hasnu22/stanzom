package com.stanzom.domain.prediction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PollRepository extends JpaRepository<Poll, UUID> {

    List<Poll> findByEventIdAndIsActiveTrue(UUID eventId);
}
