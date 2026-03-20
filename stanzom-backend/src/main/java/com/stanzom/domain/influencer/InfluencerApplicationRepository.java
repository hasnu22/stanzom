package com.stanzom.domain.influencer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InfluencerApplicationRepository extends JpaRepository<InfluencerApplication, UUID> {

    List<InfluencerApplication> findByStatus(String status);

    Optional<InfluencerApplication> findByUserId(UUID userId);
}
