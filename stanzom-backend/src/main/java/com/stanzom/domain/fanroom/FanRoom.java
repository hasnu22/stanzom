package com.stanzom.domain.fanroom;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "fan_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FanRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "sport_id")
    private UUID sportId;

    @Column(name = "invite_code", length = 20, unique = true)
    private String inviteCode;

    @Builder.Default
    @Column(name = "access_type", length = 20)
    private String accessType = "INVITE_ONLY";

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
