package com.stanzom.domain.pundit;

import com.stanzom.domain.pundit.dto.CreatePunditPostRequest;
import com.stanzom.domain.pundit.dto.PunditPostDto;
import com.stanzom.domain.pundit.dto.SharePunditRequest;
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
@RequestMapping("/api/pundit")
@RequiredArgsConstructor
@Tag(name = "Pundit Wall", description = "Pundit post and prediction wall endpoints")
public class PunditController {

    private final PunditService punditService;

    @GetMapping
    @Operation(summary = "Get pundit posts", description = "Returns pundit posts with optional filters")
    public ResponseEntity<ApiResponse<Page<PunditPostDto>>> getPunditPosts(
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) String sportSlug,
            @RequestParam(required = false, defaultValue = "ALL") String filter,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                punditService.getPunditPosts(eventId, sportSlug, filter, pageable)));
    }

    @PostMapping
    @Operation(summary = "Create pundit post", description = "Create a new pundit post with predictions")
    public ResponseEntity<ApiResponse<PunditPostDto>> createPost(
            @RequestBody CreatePunditPostRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(punditService.createPost(userId, request)));
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Like a pundit post", description = "Like a pundit post")
    public ResponseEntity<ApiResponse<Void>> likePost(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        punditService.likePost(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/share")
    @Operation(summary = "Share a pundit post", description = "Share a pundit post on a platform")
    public ResponseEntity<ApiResponse<Void>> sharePost(
            @PathVariable UUID id,
            @RequestBody SharePunditRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        punditService.sharePost(userId, id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
