package com.stanzom.domain.influencer;

import com.stanzom.domain.influencer.dto.*;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/influencers")
@RequiredArgsConstructor
@Tag(name = "Influencers", description = "Influencer management endpoints")
public class InfluencerController {

    private final InfluencerService influencerService;

    @GetMapping
    @Operation(summary = "List influencers", description = "Returns influencers with optional filters")
    public ResponseEntity<ApiResponse<Page<InfluencerDto>>> getInfluencers(
            @RequestParam(required = false) String sportSlug,
            @RequestParam(required = false) String niche,
            @RequestParam(required = false) Boolean featured,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                influencerService.getInfluencers(sportSlug, niche, featured, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get influencer by ID", description = "Returns detailed influencer information")
    public ResponseEntity<ApiResponse<InfluencerDetailDto>> getInfluencerById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(influencerService.getInfluencerById(id)));
    }

    @PostMapping("/{id}/follow")
    @Operation(summary = "Follow an influencer", description = "Follow an influencer to receive updates")
    public ResponseEntity<ApiResponse<Void>> followInfluencer(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        influencerService.followInfluencer(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Like an influencer", description = "Like an influencer profile")
    public ResponseEntity<ApiResponse<Void>> likeInfluencer(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        influencerService.likeInfluencer(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/rate")
    @Operation(summary = "Rate an influencer", description = "Submit or update an influencer rating")
    public ResponseEntity<ApiResponse<Void>> rateInfluencer(
            @PathVariable UUID id,
            @RequestBody RateInfluencerRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        influencerService.rateInfluencer(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/apply")
    @Operation(summary = "Apply to become an influencer", description = "Submit an influencer application")
    public ResponseEntity<ApiResponse<InfluencerApplicationDto>> apply(
            @RequestBody ApplyInfluencerRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(influencerService.apply(userId, request)));
    }

    @GetMapping("/applications")
    @Operation(summary = "List influencer applications", description = "Admin endpoint to view all applications")
    public ResponseEntity<ApiResponse<List<InfluencerApplicationDto>>> getApplications() {
        return ResponseEntity.ok(ApiResponse.success(influencerService.getApplications()));
    }

    @PutMapping("/applications/{id}")
    @Operation(summary = "Update application status", description = "Admin endpoint to approve or reject an application")
    public ResponseEntity<ApiResponse<InfluencerApplicationDto>> updateApplication(
            @PathVariable UUID id,
            @RequestBody UpdateApplicationRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(
                influencerService.updateApplication(id, userId, request)));
    }
}
