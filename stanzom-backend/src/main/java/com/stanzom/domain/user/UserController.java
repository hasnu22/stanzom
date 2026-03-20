package com.stanzom.domain.user;

import com.stanzom.domain.user.dto.UpdateUserRequest;
import com.stanzom.domain.user.dto.UserDto;
import com.stanzom.domain.user.dto.UserStatsDto;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the authenticated user's profile")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(userService.getCurrentUser(userId)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user", description = "Updates the authenticated user's profile")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUser(@Valid @RequestBody UpdateUserRequest request) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(userService.updateCurrentUser(userId, request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Returns a user's public profile by ID")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @GetMapping("/me/stats")
    @Operation(summary = "Get current user stats", description = "Returns the authenticated user's statistics")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User stats retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ApiResponse<UserStatsDto>> getCurrentUserStats() {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(userService.getUserStats(userId)));
    }

    private UUID extractUserId() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return UUID.fromString(userId);
    }
}
