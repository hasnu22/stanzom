package com.stanzom.domain.event;

import com.stanzom.domain.event.dto.*;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event management and interaction endpoints")
public class EventController {

    private final EventService eventService;

    @GetMapping
    @Operation(summary = "List events", description = "Returns events filtered by status, sport slug, and tournament slug")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Events retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Page<EventDto>>> getEvents(
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) String sportSlug,
            @RequestParam(required = false) String tournament,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEvents(status, sportSlug, tournament, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID", description = "Returns event details including rating and reactions summary")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Event retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<ApiResponse<EventDetailDto>> getEventById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEventById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update event", description = "Admin endpoint to update event status, scores, and metadata")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Event updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<ApiResponse<EventDto>> updateEvent(
            @PathVariable UUID id,
            @RequestBody UpdateEventRequest request) {
        return ResponseEntity.ok(ApiResponse.success(eventService.updateEvent(id, request)));
    }

    @PostMapping("/{id}/reactions")
    @Operation(summary = "Add reaction to event", description = "Adds an emoji reaction to an event")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reaction added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<Void>> addReaction(
            @PathVariable UUID id,
            @RequestBody CreateReactionRequest request) {
        UUID userId = extractUserId();
        eventService.addReaction(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/reactions/summary")
    @Operation(summary = "Get reactions summary", description = "Returns aggregated emoji reaction counts for an event")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reactions summary retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<ReactionSummaryDto>>> getReactionsSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getReactionsSummary(id)));
    }

    @PostMapping("/{id}/buzz")
    @Operation(summary = "Add buzz post", description = "Creates a new buzz post for an event")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Buzz post created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<BuzzPostDto>> addBuzzPost(
            @PathVariable UUID id,
            @RequestBody CreateBuzzPostRequest request) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(eventService.addBuzzPost(id, userId, request)));
    }

    @GetMapping("/{id}/buzz")
    @Operation(summary = "Get buzz posts", description = "Returns paginated buzz posts for an event, optionally filtered by type")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Buzz posts retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Page<BuzzPostDto>>> getBuzzPosts(
            @PathVariable UUID id,
            @RequestParam(required = false) String type,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getBuzzPosts(id, type, pageable)));
    }

    @GetMapping("/{id}/moments")
    @Operation(summary = "Get event moments", description = "Returns top buzz posts (most liked) for an event")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Moments retrieved successfully")
    })
    public ResponseEntity<ApiResponse<Page<BuzzPostDto>>> getMoments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getMoments(id)));
    }

    @PostMapping("/{id}/rate")
    @Operation(summary = "Rate an event", description = "Adds or updates a rating for an event")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Rating submitted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<Void>> rateEvent(
            @PathVariable UUID id,
            @RequestBody RateEventRequest request) {
        UUID userId = extractUserId();
        eventService.rateEvent(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/rating")
    @Operation(summary = "Get event rating", description = "Returns average rating, total ratings count, and current user's rating")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Rating retrieved successfully")
    })
    public ResponseEntity<ApiResponse<EventRatingDto>> getEventRating(@PathVariable UUID id) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(eventService.getEventRating(id, userId)));
    }

    private UUID extractUserId() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userId);
    }
}
