package com.stanzom.domain.pundit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PunditPostLikeRepository extends JpaRepository<PunditPostLike, UUID> {

    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
}
