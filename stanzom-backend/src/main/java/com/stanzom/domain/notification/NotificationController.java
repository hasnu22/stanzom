package com.stanzom.domain.notification;

import com.stanzom.domain.notification.dto.NotificationDto;
import com.stanzom.domain.notification.dto.NotificationSettingsDto;
import com.stanzom.domain.notification.dto.UpdateNotificationSettingsRequest;
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
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notifications and notification settings")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get notifications", description = "Returns paginated notifications for the authenticated user")
    public ResponseEntity<ApiResponse<Page<NotificationDto>>> getNotifications(Pageable pageable) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(userId, pageable)));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks a specific notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get notification settings", description = "Returns notification preferences for the authenticated user")
    public ResponseEntity<ApiResponse<NotificationSettingsDto>> getSettings() {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(notificationService.getSettings(userId)));
    }

    @PutMapping("/settings")
    @Operation(summary = "Update notification settings", description = "Updates notification preferences for the authenticated user")
    public ResponseEntity<ApiResponse<NotificationSettingsDto>> updateSettings(
            @RequestBody UpdateNotificationSettingsRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(notificationService.updateSettings(userId, request)));
    }
}
