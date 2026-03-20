package com.stanzom.domain.player;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "player_ratings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"player_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerRating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "player_id", nullable = false)
    private UUID playerId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "ratings", columnDefinition = "jsonb")
    private String ratings;

    @Column(name = "overall_rating")
    private BigDecimal overallRating;

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    @Builder.Default
    @Column(name = "helpful_count")
    private int helpfulCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
