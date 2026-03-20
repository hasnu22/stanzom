package com.stanzom.domain.sport;

import com.stanzom.domain.sport.dto.TournamentDto;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
@Tag(name = "Tournaments", description = "Tournament management endpoints")
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    @Operation(summary = "List tournaments", description = "Returns tournaments filtered by sport slug and active status")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tournaments retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<TournamentDto>>> getTournaments(
            @RequestParam String sportSlug,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getTournaments(sportSlug, active)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tournament by ID", description = "Returns a tournament by its ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tournament retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Tournament not found")
    })
    public ResponseEntity<ApiResponse<TournamentDto>> getTournamentById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(tournamentService.getTournamentById(id)));
    }
}
