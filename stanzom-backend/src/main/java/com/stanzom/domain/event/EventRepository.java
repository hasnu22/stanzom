package com.stanzom.domain.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query("SELECT e FROM Event e " +
            "WHERE (:statuses IS NULL OR e.status IN :statuses) " +
            "AND (:sportSlug IS NULL OR e.sport.slug = :sportSlug) " +
            "AND (:tournamentSlug IS NULL OR e.tournament.slug = :tournamentSlug)")
    Page<Event> findByFilters(
            @Param("statuses") List<String> statuses,
            @Param("sportSlug") String sportSlug,
            @Param("tournamentSlug") String tournamentSlug,
            Pageable pageable);

    List<Event> findByStatus(String status);

    List<Event> findBySportSlugAndStatus(String sportSlug, String status);
}
