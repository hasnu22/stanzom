package com.stanzom.domain.team;

import com.stanzom.domain.player.PlayerMapper;
import com.stanzom.domain.player.PlayerRepository;
import com.stanzom.domain.player.UserFollow;
import com.stanzom.domain.player.UserFollowRepository;
import com.stanzom.domain.player.dto.PlayerDto;
import com.stanzom.domain.sport.Sport;
import com.stanzom.domain.sport.SportRepository;
import com.stanzom.domain.team.dto.RateTeamRequest;
import com.stanzom.domain.team.dto.TeamDetailDto;
import com.stanzom.domain.team.dto.TeamDto;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamRatingRepository teamRatingRepository;
    private final TeamMapper teamMapper;
    private final PlayerRepository playerRepository;
    private final PlayerMapper playerMapper;
    private final UserFollowRepository userFollowRepository;
    private final SportRepository sportRepository;

    public List<TeamDto> getTeams(String sportSlug, UUID tournamentId) {
        List<Team> teams;

        UUID sportId = null;
        if (sportSlug != null) {
            sportId = sportRepository.findBySlug(sportSlug)
                    .map(Sport::getId)
                    .orElse(null);
        }

        if (sportId != null && tournamentId != null) {
            teams = teamRepository.findBySportIdAndTournamentId(sportId, tournamentId);
        } else if (sportId != null) {
            teams = teamRepository.findBySportId(sportId);
        } else if (tournamentId != null) {
            teams = teamRepository.findByTournamentId(tournamentId);
        } else {
            teams = teamRepository.findAll();
        }

        return teams.stream()
                .map(team -> {
                    TeamDto dto = teamMapper.toDto(team);
                    String sportName = sportRepository.findById(team.getSportId())
                            .map(Sport::getName)
                            .orElse(null);
                    return new TeamDto(
                            dto.id(),
                            dto.sportId(),
                            dto.tournamentId(),
                            dto.shortName(),
                            dto.fullName(),
                            dto.city(),
                            dto.homeGround(),
                            dto.primaryColor(),
                            dto.secondaryColor(),
                            dto.logoUrl(),
                            dto.followersCount(),
                            dto.overallRating(),
                            dto.ratingCount(),
                            dto.foundedYear(),
                            dto.titles(),
                            sportName
                    );
                })
                .toList();
    }

    public TeamDetailDto getTeamById(UUID id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", id.toString()));

        BigDecimal averageRating = teamRatingRepository.findAverageOverallRatingByTeamId(id);

        String sportName = sportRepository.findById(team.getSportId())
                .map(Sport::getName)
                .orElse(null);

        List<PlayerDto> squad = playerMapper.toDtoList(playerRepository.findByTeamId(id));

        return new TeamDetailDto(
                team.getId(),
                team.getSportId(),
                team.getTournamentId(),
                team.getShortName(),
                team.getFullName(),
                team.getCity(),
                team.getHomeGround(),
                team.getPrimaryColor(),
                team.getSecondaryColor(),
                team.getLogoUrl(),
                team.getFollowersCount(),
                team.getOverallRating(),
                team.getRatingCount(),
                team.getFoundedYear(),
                team.getTitles(),
                sportName,
                averageRating,
                null,
                squad
        );
    }

    public List<PlayerDto> getSquad(UUID teamId) {
        teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId.toString()));
        return playerMapper.toDtoList(playerRepository.findByTeamId(teamId));
    }

    @Transactional
    public void followTeam(UUID userId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId.toString()));

        if (userFollowRepository.existsByUserIdAndEntityTypeAndEntityId(userId, "TEAM", teamId)) {
            return;
        }

        UserFollow follow = UserFollow.builder()
                .userId(userId)
                .entityType("TEAM")
                .entityId(teamId)
                .build();
        userFollowRepository.save(follow);

        team.setFollowersCount(team.getFollowersCount() + 1);
        teamRepository.save(team);
    }

    @Transactional
    public void unfollowTeam(UUID userId, UUID teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId.toString()));

        if (!userFollowRepository.existsByUserIdAndEntityTypeAndEntityId(userId, "TEAM", teamId)) {
            return;
        }

        userFollowRepository.deleteByUserIdAndEntityTypeAndEntityId(userId, "TEAM", teamId);

        team.setFollowersCount(Math.max(0, team.getFollowersCount() - 1));
        teamRepository.save(team);
    }

    @Transactional
    public void rateTeam(UUID userId, UUID teamId, RateTeamRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId.toString()));

        TeamRating rating = teamRatingRepository.findByTeamIdAndUserId(teamId, userId)
                .orElse(TeamRating.builder()
                        .teamId(teamId)
                        .userId(userId)
                        .build());

        rating.setRatings(request.ratings());
        rating.setOverallRating(request.overallRating());
        rating.setReviewText(request.reviewText());
        teamRatingRepository.save(rating);

        BigDecimal averageRating = teamRatingRepository.findAverageOverallRatingByTeamId(teamId);
        team.setOverallRating(averageRating != null ? averageRating : BigDecimal.ZERO);
        team.setRatingCount((int) teamRatingRepository.count());
        teamRepository.save(team);
    }
}
