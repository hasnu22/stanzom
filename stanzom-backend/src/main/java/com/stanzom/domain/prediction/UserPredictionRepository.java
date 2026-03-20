package com.stanzom.domain.prediction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPredictionRepository extends JpaRepository<UserPrediction, UUID> {

    List<UserPrediction> findByUserIdAndEventId(UUID userId, UUID eventId);

    List<UserPrediction> findByEventId(UUID eventId);

    Optional<UserPrediction> findByUserIdAndQuestionId(UUID userId, UUID questionId);

    List<UserPrediction> findByQuestionId(UUID questionId);

    @Query("SELECT COUNT(up) FROM UserPrediction up WHERE up.userId = :userId AND up.isCorrect = true")
    long countByUserIdAndIsCorrectTrue(@Param("userId") UUID userId);

    @Query("SELECT COUNT(up) FROM UserPrediction up WHERE up.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(up.pointsEarned), 0) FROM UserPrediction up WHERE up.userId = :userId")
    Integer sumPointsEarnedByUserId(@Param("userId") UUID userId);
}
