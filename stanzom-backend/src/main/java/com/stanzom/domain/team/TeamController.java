package com.stanzom.domain.team;

import com.stanzom.domain.player.dto.PlayerDto;
import com.stanzom.domain.team.dto.RateTeamRequest;
import com.stanzom.domain.team.dto.TeamDetailDto;
import com.stanzom.domain.team.dto.TeamDto;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Teams", description = "Team management endpoints")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "List teams", description = "Returns teams with optional sport and tournament filters")
    public ResponseEntity<ApiResponse<List<TeamDto>>> getTeams(
            @RequestParam(required = false) String sportSlug,
            @RequestParam(required = false) UUID tournamentId) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getTeams(sportSlug, tournamentId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get team by ID", description = "Returns detailed team information including squad")
    public ResponseEntity<ApiResponse<TeamDetailDto>> getTeamById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getTeamById(id)));
    }

    @GetMapping("/{id}/squad")
    @Operation(summary = "Get team squad", description = "Returns the list of players in the team")
    public ResponseEntity<ApiResponse<List<PlayerDto>>> getSquad(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getSquad(id)));
    }

    @PostMapping("/{id}/follow")
    @Operation(summary = "Follow a team", description = "Follow a team to receive updates")
    public ResponseEntity<ApiResponse<Void>> followTeam(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        teamService.followTeam(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}/follow")
    @Operation(summary = "Unfollow a team", description = "Stop following a team")
    public ResponseEntity<ApiResponse<Void>> unfollowTeam(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        teamService.unfollowTeam(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/rate")
    @Operation(summary = "Rate a team", description = "Submit or update a team rating")
    public ResponseEntity<ApiResponse<Void>> rateTeam(
            @PathVariable UUID id,
            @RequestBody RateTeamRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        teamService.rateTeam(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
