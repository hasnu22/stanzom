package com.stanzom.domain.player;

import com.stanzom.domain.player.dto.PlayerDetailDto;
import com.stanzom.domain.player.dto.PlayerDto;
import com.stanzom.domain.player.dto.RatePlayerRequest;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
@Tag(name = "Players", description = "Player management endpoints")
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping
    @Operation(summary = "List players", description = "Returns players with optional filters and sorting")
    public ResponseEntity<ApiResponse<Page<PlayerDto>>> getPlayers(
            @RequestParam(required = false) String sportSlug,
            @RequestParam(required = false) UUID teamId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String sortBy,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                playerService.getPlayers(sportSlug, teamId, role, sortBy, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get player by ID", description = "Returns detailed player information")
    public ResponseEntity<ApiResponse<PlayerDetailDto>> getPlayerById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(playerService.getPlayerById(id)));
    }

    @PostMapping("/{id}/follow")
    @Operation(summary = "Follow a player", description = "Follow a player to receive updates")
    public ResponseEntity<ApiResponse<Void>> followPlayer(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        playerService.followPlayer(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}/follow")
    @Operation(summary = "Unfollow a player", description = "Stop following a player")
    public ResponseEntity<ApiResponse<Void>> unfollowPlayer(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        playerService.unfollowPlayer(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Like a player", description = "Like a player profile")
    public ResponseEntity<ApiResponse<Void>> likePlayer(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        playerService.likePlayer(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/rate")
    @Operation(summary = "Rate a player", description = "Submit or update a player rating")
    public ResponseEntity<ApiResponse<Void>> ratePlayer(
            @PathVariable UUID id,
            @RequestBody RatePlayerRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        playerService.ratePlayer(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
