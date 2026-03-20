package com.stanzom.domain.fanroom;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "fan_room_invites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FanRoomInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "room_id")
    private UUID roomId;

    @Column(name = "invited_by")
    private UUID invitedBy;

    @Column(name = "invited_user_id")
    private UUID invitedUserId;

    @Column(name = "mobile_number", length = 15)
    private String mobileNumber;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "PENDING";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
