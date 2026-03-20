package com.stanzom.domain.player;

import com.stanzom.domain.player.dto.PlayerDetailDto;
import com.stanzom.domain.player.dto.PlayerDto;
import com.stanzom.domain.player.dto.RatePlayerRequest;
import com.stanzom.domain.sport.Sport;
import com.stanzom.domain.sport.SportRepository;
import com.stanzom.domain.team.Team;
import com.stanzom.domain.team.TeamRepository;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PlayerRatingRepository playerRatingRepository;
    private final UserFollowRepository userFollowRepository;
    private final PlayerMapper playerMapper;
    private final SportRepository sportRepository;
    private final TeamRepository teamRepository;

    public Page<PlayerDto> getPlayers(String sportSlug, UUID teamId, String role, String sortBy, Pageable pageable) {
        UUID sportId = null;
        if (sportSlug != null) {
            Sport sport = sportRepository.findBySlug(sportSlug)
                    .orElseThrow(() -> new ResourceNotFoundException("Sport", "slug", sportSlug));
            sportId = sport.getId();
        }

        return playerRepository.findWithFilters(sportId, teamId, role, sortBy, pageable)
                .map(player -> {
                    PlayerDto dto = playerMapper.toDto(player);
                    return enrichPlayerDto(dto, player);
                });
    }

    public PlayerDetailDto getPlayerById(UUID id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player", "id", id.toString()));

        BigDecimal averageRating = playerRatingRepository.findAverageOverallRatingByPlayerId(id);

        String teamName = null;
        if (player.getTeamId() != null) {
            teamName = teamRepository.findById(player.getTeamId())
                    .map(Team::getFullName)
                    .orElse(null);
        }

        String sportName = sportRepository.findById(player.getSportId())
                .map(Sport::getName)
                .orElse(null);

        return new PlayerDetailDto(
                player.getId(),
                player.getSportId(),
                player.getName(),
                player.getTeamId(),
                player.getRole(),
                player.getCountry(),
                player.getJerseyNumber(),
                player.getFollowersCount(),
                player.getLikesCount(),
                player.getOverallRating(),
                player.getRatingCount(),
                player.getBio(),
                player.getImageUrl(),
                player.getStats(),
                player.isActive(),
                teamName,
                sportName,
                averageRating,
                null
        );
    }

    @Transactional
    public void followPlayer(UUID userId, UUID playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player", "id", playerId.toString()));

        if (userFollowRepository.existsByUserIdAndEntityTypeAndEntityId(userId, "PLAYER", playerId)) {
            return;
        }

        UserFollow follow = UserFollow.builder()
                .userId(userId)
                .entityType("PLAYER")
                .entityId(playerId)
                .build();
        userFollowRepository.save(follow);

        player.setFollowersCount(player.getFollowersCount() + 1);
        playerRepository.save(player);
    }

    @Transactional
    public void unfollowPlayer(UUID userId, UUID playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player", "id", playerId.toString()));

        if (!userFollowRepository.existsByUserIdAndEntityTypeAndEntityId(userId, "PLAYER", playerId)) {
            return;
        }

        userFollowRepository.deleteByUserIdAndEntityTypeAndEntityId(userId, "PLAYER", playerId);

        player.setFollowersCount(Math.max(0, player.getFollowersCount() - 1));
        playerRepository.save(player);
    }

    @Transactional
    public void likePlayer(UUID userId, UUID playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player", "id", playerId.toString()));

        player.setLikesCount(player.getLikesCount() + 1);
        playerRepository.save(player);
    }

    @Transactional
    public void ratePlayer(UUID userId, UUID playerId, RatePlayerRequest request) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player", "id", playerId.toString()));

        PlayerRating rating = playerRatingRepository.findByPlayerIdAndUserId(playerId, userId)
                .orElse(PlayerRating.builder()
                        .playerId(playerId)
                        .userId(userId)
                        .build());

        rating.setRatings(request.ratings());
        rating.setOverallRating(request.overallRating());
        rating.setReviewText(request.reviewText());
        playerRatingRepository.save(rating);

        BigDecimal averageRating = playerRatingRepository.findAverageOverallRatingByPlayerId(playerId);
        player.setOverallRating(averageRating != null ? averageRating : BigDecimal.ZERO);
        player.setRatingCount((int) playerRatingRepository.count());
        playerRepository.save(player);
    }

    private PlayerDto enrichPlayerDto(PlayerDto dto, Player player) {
        String teamName = null;
        if (player.getTeamId() != null) {
            teamName = teamRepository.findById(player.getTeamId())
                    .map(Team::getFullName)
                    .orElse(null);
        }

        String sportName = sportRepository.findById(player.getSportId())
                .map(Sport::getName)
                .orElse(null);

        return new PlayerDto(
                dto.id(),
                dto.sportId(),
                dto.name(),
                dto.teamId(),
                dto.role(),
                dto.country(),
                dto.jerseyNumber(),
                dto.followersCount(),
                dto.likesCount(),
                dto.overallRating(),
                dto.ratingCount(),
                dto.bio(),
                dto.imageUrl(),
                dto.stats(),
                dto.isActive(),
                teamName,
                sportName
        );
    }
}
