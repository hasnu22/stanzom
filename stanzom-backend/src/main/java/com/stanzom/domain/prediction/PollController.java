package com.stanzom.domain.prediction;

import com.stanzom.domain.prediction.dto.PollDto;
import com.stanzom.domain.prediction.dto.PollResultDto;
import com.stanzom.domain.prediction.dto.PollVoteRequest;
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
@RequestMapping("/api/polls")
@RequiredArgsConstructor
@Tag(name = "Polls", description = "Poll and voting endpoints")
public class PollController {

    private final PollService pollService;

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get polls for event", description = "Returns active polls for an event")
    public ResponseEntity<ApiResponse<List<PollDto>>> getPolls(@PathVariable UUID eventId) {
        return ResponseEntity.ok(ApiResponse.success(pollService.getPolls(eventId)));
    }

    @PostMapping("/{pollId}/vote")
    @Operation(summary = "Vote on a poll", description = "Submit a vote on a poll")
    public ResponseEntity<ApiResponse<PollResultDto>> vote(
            @PathVariable UUID pollId,
            @RequestBody PollVoteRequest request) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(pollService.vote(userId, pollId, request)));
    }

    private UUID extractUserId() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userId);
    }
}
