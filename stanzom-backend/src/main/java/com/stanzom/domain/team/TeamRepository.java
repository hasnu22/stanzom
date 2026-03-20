package com.stanzom.domain.team;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {

    List<Team> findBySportId(UUID sportId);

    List<Team> findByTournamentId(UUID tournamentId);

    List<Team> findBySportIdAndTournamentId(UUID sportId, UUID tournamentId);
}
