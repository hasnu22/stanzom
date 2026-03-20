package com.stanzom.domain.fanroom;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "fan_room_members", uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FanRoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "room_id")
    private UUID roomId;

    @Column(name = "user_id")
    private UUID userId;

    @Builder.Default
    @Column(name = "role", length = 20)
    private String role = "MEMBER";

    @CreationTimestamp
    @Column(name = "joined_at")
    private OffsetDateTime joinedAt;
}
