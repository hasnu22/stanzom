package com.stanzom.domain.reward;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, UUID> {

    List<RewardTransaction> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT COALESCE(SUM(r.points), 0) FROM RewardTransaction r WHERE r.userId = :userId")
    int sumPointsByUserId(@Param("userId") UUID userId);
}
