package com.stanzom.domain.fanroom;

import com.stanzom.domain.fanroom.dto.*;
import com.stanzom.domain.user.User;
import com.stanzom.domain.user.UserRepository;
import com.stanzom.shared.BadRequestException;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FanRoomService {

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int INVITE_CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final FanRoomRepository fanRoomRepository;
    private final FanRoomMemberRepository fanRoomMemberRepository;
    private final FanRoomInviteRepository fanRoomInviteRepository;
    private final FanRoomMessageRepository fanRoomMessageRepository;
    private final FanRoomMapper fanRoomMapper;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public FanRoomDto createRoom(UUID userId, CreateFanRoomRequest request) {
        String inviteCode = generateInviteCode();

        FanRoom fanRoom = FanRoom.builder()
                .name(request.name())
                .createdBy(userId)
                .eventId(request.eventId())
                .sportId(request.sportId())
                .inviteCode(inviteCode)
                .accessType(request.accessType() != null ? request.accessType() : "INVITE_ONLY")
                .build();

        FanRoom savedRoom = fanRoomRepository.save(fanRoom);

        FanRoomMember adminMember = FanRoomMember.builder()
                .roomId(savedRoom.getId())
                .userId(userId)
                .role("ADMIN")
                .build();

        fanRoomMemberRepository.save(adminMember);

        return toFanRoomDto(savedRoom);
    }

    @Transactional(readOnly = true)
    public List<FanRoomDto> getMyRooms(UUID userId) {
        List<FanRoom> rooms = fanRoomRepository.findByMembership(userId);
        return rooms.stream().map(this::toFanRoomDto).toList();
    }

    @Transactional(readOnly = true)
    public FanRoomDto getRoomById(UUID roomId) {
        FanRoom room = fanRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("FanRoom", "id", roomId));
        return toFanRoomDto(room);
    }

    public FanRoomMessageDto sendMessage(UUID roomId, UUID userId, SendMessageRequest request) {
        FanRoom room = fanRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("FanRoom", "id", roomId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        FanRoomMessage message = FanRoomMessage.builder()
                .roomId(roomId)
                .userId(userId)
                .content(request.content())
                .messageType(request.messageType() != null ? request.messageType() : "TEXT")
                .createdAt(OffsetDateTime.now())
                .build();

        FanRoomMessage savedMessage = fanRoomMessageRepository.save(message);

        FanRoomMessageDto messageDto = new FanRoomMessageDto(
                savedMessage.getId(),
                savedMessage.getUserId(),
                user.getName(),
                savedMessage.getContent(),
                savedMessage.getMessageType(),
                savedMessage.getCreatedAt()
        );

        messagingTemplate.convertAndSend("/topic/fanroom/" + roomId + "/messages", messageDto);

        return messageDto;
    }

    @Transactional(readOnly = true)
    public Page<FanRoomMessageDto> getMessages(UUID roomId, Pageable pageable) {
        return fanRoomMessageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, pageable)
                .map(message -> {
                    String userName = userRepository.findById(message.getUserId())
                            .map(User::getName)
                            .orElse(null);
                    return new FanRoomMessageDto(
                            message.getId(),
                            message.getUserId(),
                            userName,
                            message.getContent(),
                            message.getMessageType(),
                            message.getCreatedAt()
                    );
                });
    }

    public FanRoomInviteDto inviteContact(UUID roomId, UUID userId, InviteContactRequest request) {
        FanRoom room = fanRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("FanRoom", "id", roomId));

        FanRoomInvite invite = FanRoomInvite.builder()
                .roomId(roomId)
                .invitedBy(userId)
                .invitedUserId(request.userId())
                .mobileNumber(request.mobileNumber())
                .createdAt(OffsetDateTime.now())
                .build();

        FanRoomInvite savedInvite = fanRoomInviteRepository.save(invite);
        return fanRoomMapper.toInviteDto(savedInvite);
    }

    public void acceptInvite(UUID roomId, UUID userId) {
        FanRoomInvite invite = fanRoomInviteRepository.findByRoomIdAndInvitedUserIdAndStatus(roomId, userId, "PENDING")
                .orElseThrow(() -> new ResourceNotFoundException("FanRoomInvite", "roomId/userId", roomId));

        invite.setStatus("ACCEPTED");
        fanRoomInviteRepository.save(invite);

        if (!fanRoomMemberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            FanRoomMember member = FanRoomMember.builder()
                    .roomId(roomId)
                    .userId(userId)
                    .role("MEMBER")
                    .build();
            fanRoomMemberRepository.save(member);
        }
    }

    public void declineInvite(UUID roomId, UUID userId) {
        FanRoomInvite invite = fanRoomInviteRepository.findByRoomIdAndInvitedUserIdAndStatus(roomId, userId, "PENDING")
                .orElseThrow(() -> new ResourceNotFoundException("FanRoomInvite", "roomId/userId", roomId));

        invite.setStatus("DECLINED");
        fanRoomInviteRepository.save(invite);
    }

    public FanRoomDto joinByInviteCode(String inviteCode, UUID userId) {
        FanRoom room = fanRoomRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException("FanRoom", "inviteCode", inviteCode));

        if (fanRoomMemberRepository.existsByRoomIdAndUserId(room.getId(), userId)) {
            throw new BadRequestException("Already a member of this room");
        }

        FanRoomMember member = FanRoomMember.builder()
                .roomId(room.getId())
                .userId(userId)
                .role("MEMBER")
                .build();

        fanRoomMemberRepository.save(member);

        return toFanRoomDto(room);
    }

    @Transactional(readOnly = true)
    public List<FanRoomMemberDto> getMembers(UUID roomId) {
        List<FanRoomMember> members = fanRoomMemberRepository.findByRoomId(roomId);
        return members.stream().map(member -> {
            String userName = userRepository.findById(member.getUserId())
                    .map(User::getName)
                    .orElse(null);
            return new FanRoomMemberDto(
                    member.getId(),
                    member.getUserId(),
                    userName,
                    member.getRole(),
                    member.getJoinedAt()
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<FanRoomInviteDto> getPendingInvites(UUID roomId) {
        List<FanRoomInvite> invites = fanRoomInviteRepository.findByRoomId(roomId);
        return invites.stream()
                .filter(invite -> "PENDING".equals(invite.getStatus()))
                .map(fanRoomMapper::toInviteDto)
                .toList();
    }

    private FanRoomDto toFanRoomDto(FanRoom room) {
        int memberCount = fanRoomMemberRepository.findByRoomId(room.getId()).size();
        return new FanRoomDto(
                room.getId(),
                room.getName(),
                room.getCreatedBy(),
                room.getEventId(),
                room.getSportId(),
                room.getInviteCode(),
                room.getAccessType(),
                room.isActive(),
                room.getCreatedAt(),
                memberCount
        );
    }

    private String generateInviteCode() {
        StringBuilder code = new StringBuilder(INVITE_CODE_LENGTH);
        for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
            code.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return code.toString();
    }
}
