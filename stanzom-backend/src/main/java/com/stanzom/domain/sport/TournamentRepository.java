package com.stanzom.domain.sport;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TournamentRepository extends JpaRepository<Tournament, UUID> {

    List<Tournament> findBySportSlugAndIsActiveTrue(String sportSlug);

    List<Tournament> findBySportSlug(String sportSlug);

    Optional<Tournament> findBySlug(String slug);
}
