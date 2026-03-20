package com.stanzom.domain.player;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PlayerRepository extends JpaRepository<Player, UUID> {

    List<Player> findByTeamId(UUID teamId);

    List<Player> findBySportId(UUID sportId);

    @Query("""
            SELECT p FROM Player p
            WHERE (:sportId IS NULL OR p.sportId = :sportId)
            AND (:teamId IS NULL OR p.teamId = :teamId)
            AND (:role IS NULL OR p.role = :role)
            AND p.isActive = true
            ORDER BY
                CASE WHEN :sortBy = 'followers' THEN p.followersCount END DESC,
                CASE WHEN :sortBy = 'rating' THEN p.overallRating END DESC,
                CASE WHEN :sortBy = 'likes' THEN p.likesCount END DESC,
                p.name ASC
            """)
    Page<Player> findWithFilters(
            @Param("sportId") UUID sportId,
            @Param("teamId") UUID teamId,
            @Param("role") String role,
            @Param("sortBy") String sortBy,
            Pageable pageable
    );
}
