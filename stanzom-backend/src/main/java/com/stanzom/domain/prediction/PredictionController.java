package com.stanzom.domain.prediction;

import com.stanzom.domain.prediction.dto.*;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@Tag(name = "Predictions", description = "Prediction question and answer endpoints")
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping("/event/{eventId}/questions")
    @Operation(summary = "Get prediction questions", description = "Returns active prediction questions for an event")
    public ResponseEntity<ApiResponse<List<PredictionQuestionDto>>> getQuestions(@PathVariable UUID eventId) {
        return ResponseEntity.ok(ApiResponse.success(predictionService.getQuestions(eventId)));
    }

    @PostMapping("/questions/{questionId}/answer")
    @Operation(summary = "Answer a prediction question", description = "Submit an answer for a prediction question")
    public ResponseEntity<ApiResponse<UserPredictionDto>> answerQuestion(
            @PathVariable UUID questionId,
            @RequestBody AnswerPredictionRequest request) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(predictionService.answerQuestion(userId, questionId, request)));
    }

    @PutMapping("/questions/{questionId}/lock")
    @Operation(summary = "Lock a prediction", description = "Lock a prediction so it cannot be changed")
    public ResponseEntity<ApiResponse<UserPredictionDto>> lockPrediction(@PathVariable UUID questionId) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(predictionService.lockPrediction(userId, questionId)));
    }

    @GetMapping("/event/{eventId}/my-card")
    @Operation(summary = "Get prediction card", description = "Returns the user's prediction card for an event")
    public ResponseEntity<ApiResponse<PredictionCardDto>> getPredictionCard(@PathVariable UUID eventId) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(predictionService.getPredictionCard(userId, eventId)));
    }

    @PostMapping("/questions/{questionId}/resolve")
    @Operation(summary = "Resolve a prediction question (Admin)", description = "Set the correct answer and award points")
    public ResponseEntity<ApiResponse<Void>> resolveQuestion(
            @PathVariable UUID questionId,
            @RequestBody ResolvePredictionRequest request) {
        predictionService.resolveQuestion(questionId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Get leaderboard", description = "Returns the prediction leaderboard filtered by scope")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getLeaderboard(
            @RequestParam(defaultValue = "GLOBAL") String scope,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sportSlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(predictionService.getLeaderboard(scope, city, state, sportSlug, pageable)));
    }

    private UUID extractUserId() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userId);
    }
}
