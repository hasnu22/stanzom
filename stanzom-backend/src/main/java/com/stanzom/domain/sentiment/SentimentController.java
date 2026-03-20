package com.stanzom.domain.sentiment;

import com.stanzom.domain.sentiment.dto.*;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/sentiment")
@RequiredArgsConstructor
@Tag(name = "Sentiment", description = "Fan sentiment voting and geographic breakdown")
public class SentimentController {

    private final SentimentService sentimentService;

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get sentiment for event", description = "Returns vote counts per team and user's vote for the event")
    public ResponseEntity<ApiResponse<SentimentSummaryDto>> getSentiment(@PathVariable UUID eventId) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(sentimentService.getSentiment(eventId, userId)));
    }

    @PostMapping("/event/{eventId}/vote")
    @Operation(summary = "Vote for a team", description = "Casts a sentiment vote for a team in an event (one vote per user per event)")
    public ResponseEntity<ApiResponse<SentimentSummaryDto>> vote(
            @PathVariable UUID eventId,
            @RequestBody SentimentVoteRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(sentimentService.vote(eventId, userId, request)));
    }

    @GetMapping("/event/{eventId}/map")
    @Operation(summary = "Get sentiment map", description = "Returns geographic breakdown of sentiment votes for an event")
    public ResponseEntity<ApiResponse<SentimentMapDto>> getSentimentMap(@PathVariable UUID eventId) {
        return ResponseEntity.ok(ApiResponse.success(sentimentService.getSentimentMap(eventId)));
    }
}
