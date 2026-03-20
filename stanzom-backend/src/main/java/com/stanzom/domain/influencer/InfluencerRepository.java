package com.stanzom.domain.influencer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InfluencerRepository extends JpaRepository<Influencer, UUID> {

    List<Influencer> findByIsFeaturedTrueOrderByFeaturedOrderAsc();

    Optional<Influencer> findByUserId(UUID userId);

    @Query("SELECT i FROM Influencer i WHERE " +
           "(:featured IS NULL OR i.isFeatured = :featured) " +
           "ORDER BY i.likesCount DESC")
    Page<Influencer> findWithFilters(@Param("featured") Boolean featured, Pageable pageable);
}
