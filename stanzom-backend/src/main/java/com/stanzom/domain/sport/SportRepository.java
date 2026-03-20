package com.stanzom.domain.sport;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SportRepository extends JpaRepository<Sport, UUID> {

    Optional<Sport> findBySlug(String slug);

    List<Sport> findByIsActiveTrueOrderByDisplayOrderAsc();
}
