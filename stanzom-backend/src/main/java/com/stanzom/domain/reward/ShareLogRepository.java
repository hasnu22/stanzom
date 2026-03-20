package com.stanzom.domain.reward;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShareLogRepository extends JpaRepository<ShareLog, UUID> {

    List<ShareLog> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
