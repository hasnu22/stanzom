package com.stanzom.domain.event;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_buzz_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventBuzzPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "post_type", length = 20)
    private String postType;

    @Column(name = "event_moment", length = 50)
    private String eventMoment;

    @Builder.Default
    @Column(name = "likes_count")
    private int likesCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
