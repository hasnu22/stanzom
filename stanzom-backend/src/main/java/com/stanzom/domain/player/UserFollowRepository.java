package com.stanzom.domain.player;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserFollowRepository extends JpaRepository<UserFollow, UUID> {

    Optional<UserFollow> findByUserIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);

    boolean existsByUserIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);

    void deleteByUserIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);
}
