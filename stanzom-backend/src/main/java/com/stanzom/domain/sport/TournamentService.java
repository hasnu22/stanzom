package com.stanzom.domain.sport;

import com.stanzom.domain.sport.dto.TournamentDto;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentMapper tournamentMapper;

    public List<TournamentDto> getTournaments(String sportSlug, Boolean active) {
        List<Tournament> tournaments;
        if (active != null && active) {
            tournaments = tournamentRepository.findBySportSlugAndIsActiveTrue(sportSlug);
        } else {
            tournaments = tournamentRepository.findBySportSlug(sportSlug);
        }
        return tournamentMapper.toDtoList(tournaments);
    }

    public TournamentDto getTournamentById(UUID id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", "id", id));
        return tournamentMapper.toDto(tournament);
    }
}
