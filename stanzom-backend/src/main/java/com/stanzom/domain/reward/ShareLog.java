package com.stanzom.domain.reward;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "share_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "platform", length = 30)
    private String platform;

    @Column(name = "content_type", length = 50)
    private String contentType;

    @Column(name = "content_id", length = 100)
    private String contentId;

    @Column(name = "points_awarded")
    private Integer pointsAwarded;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
