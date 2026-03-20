package com.stanzom.domain.fanroom;

import com.stanzom.domain.fanroom.dto.*;
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
@RequestMapping("/api/fanrooms")
@RequiredArgsConstructor
@Tag(name = "Fan Rooms", description = "Fan room management endpoints")
public class FanRoomController {

    private final FanRoomService fanRoomService;

    @PostMapping
    @Operation(summary = "Create a fan room", description = "Creates a new fan room with the authenticated user as admin")
    public ResponseEntity<ApiResponse<FanRoomDto>> createRoom(@RequestBody CreateFanRoomRequest request) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.createRoom(userId, request)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my fan rooms", description = "Returns all fan rooms the authenticated user is a member of")
    public ResponseEntity<ApiResponse<List<FanRoomDto>>> getMyRooms() {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.getMyRooms(userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get fan room by ID", description = "Returns a fan room by its ID")
    public ResponseEntity<ApiResponse<FanRoomDto>> getRoomById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.getRoomById(id)));
    }

    @PostMapping("/{id}/messages")
    @Operation(summary = "Send a message", description = "Sends a message to a fan room and broadcasts via WebSocket")
    public ResponseEntity<ApiResponse<FanRoomMessageDto>> sendMessage(
            @PathVariable UUID id,
            @RequestBody SendMessageRequest request) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.sendMessage(id, userId, request)));
    }

    @GetMapping("/{id}/messages")
    @Operation(summary = "Get messages", description = "Returns paginated messages for a fan room")
    public ResponseEntity<ApiResponse<Page<FanRoomMessageDto>>> getMessages(
            @PathVariable UUID id,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.getMessages(id, pageable)));
    }

    @PostMapping("/{id}/invite/contact")
    @Operation(summary = "Invite a contact", description = "Invites a user to the fan room by contact info")
    public ResponseEntity<ApiResponse<FanRoomInviteDto>> inviteContact(
            @PathVariable UUID id,
            @RequestBody InviteContactRequest request) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.inviteContact(id, userId, request)));
    }

    @PostMapping("/{id}/invite/accept")
    @Operation(summary = "Accept invite", description = "Accepts a pending invite to a fan room")
    public ResponseEntity<ApiResponse<Void>> acceptInvite(@PathVariable UUID id) {
        UUID userId = extractUserId();
        fanRoomService.acceptInvite(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/{id}/invite/decline")
    @Operation(summary = "Decline invite", description = "Declines a pending invite to a fan room")
    public ResponseEntity<ApiResponse<Void>> declineInvite(@PathVariable UUID id) {
        UUID userId = extractUserId();
        fanRoomService.declineInvite(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/join/{inviteCode}")
    @Operation(summary = "Join by invite code", description = "Joins a fan room using an invite code")
    public ResponseEntity<ApiResponse<FanRoomDto>> joinByInviteCode(@PathVariable String inviteCode) {
        UUID userId = extractUserId();
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.joinByInviteCode(inviteCode, userId)));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get members", description = "Returns all members of a fan room")
    public ResponseEntity<ApiResponse<List<FanRoomMemberDto>>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.getMembers(id)));
    }

    @GetMapping("/{id}/contacts")
    @Operation(summary = "Get pending invites", description = "Returns all pending invites for a fan room")
    public ResponseEntity<ApiResponse<List<FanRoomInviteDto>>> getPendingInvites(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(fanRoomService.getPendingInvites(id)));
    }

    private UUID extractUserId() {
        return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
