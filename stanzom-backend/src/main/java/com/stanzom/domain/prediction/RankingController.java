package com.stanzom.domain.prediction;

import com.stanzom.domain.prediction.dto.LeaderboardEntryDto;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
@Tag(name = "Rankings", description = "Leaderboard and ranking endpoints")
public class RankingController {

    private final PredictionService predictionService;

    @GetMapping
    @Operation(summary = "Get rankings", description = "Returns leaderboard rankings filtered by scope, city, state, or sport")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getRankings(
            @RequestParam(defaultValue = "GLOBAL") String scope,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sportSlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(predictionService.getLeaderboard(scope, city, state, sportSlug, pageable)));
    }
}
