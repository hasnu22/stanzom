package com.stanzom.domain.prediction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PredictionQuestionRepository extends JpaRepository<PredictionQuestion, UUID> {

    List<PredictionQuestion> findByEventIdAndIsActiveTrue(UUID eventId);

    List<PredictionQuestion> findByEventId(UUID eventId);
}
