package com.stanzom.domain.pundit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PunditPostRepository extends JpaRepository<PunditPost, UUID> {

    Page<PunditPost> findByEventIdOrderByCreatedAtDesc(UUID eventId, Pageable pageable);

    Page<PunditPost> findBySportIdOrderByCreatedAtDesc(UUID sportId, Pageable pageable);

    Page<PunditPost> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Query("""
            SELECT p FROM PunditPost p
            LEFT JOIN PunditPostPick pk ON pk.postId = p.id
            WHERE (:eventId IS NULL OR p.eventId = :eventId)
            AND (:sportId IS NULL OR p.sportId = :sportId)
            AND (:filter = 'ALL'
                 OR (:filter = 'CORRECT' AND pk.isCorrect = true)
                 OR (:filter = 'WRONG' AND pk.isCorrect = false)
                 OR (:filter = 'TOP'))
            GROUP BY p.id
            ORDER BY CASE WHEN :filter = 'TOP' THEN p.likesCount END DESC,
                     p.createdAt DESC
            """)
    Page<PunditPost> findWithFilters(
            @Param("eventId") UUID eventId,
            @Param("sportId") UUID sportId,
            @Param("filter") String filter,
            Pageable pageable);
}
