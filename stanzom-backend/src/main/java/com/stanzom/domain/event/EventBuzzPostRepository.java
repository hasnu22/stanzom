package com.stanzom.domain.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EventBuzzPostRepository extends JpaRepository<EventBuzzPost, UUID> {

    Page<EventBuzzPost> findByEventIdOrderByCreatedAtDesc(UUID eventId, Pageable pageable);

    Page<EventBuzzPost> findByEventIdAndPostTypeOrderByCreatedAtDesc(UUID eventId, String postType, Pageable pageable);
}
