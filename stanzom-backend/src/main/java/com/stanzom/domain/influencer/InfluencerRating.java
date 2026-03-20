package com.stanzom.domain.influencer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "influencer_ratings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"influencer_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfluencerRating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "influencer_id", nullable = false)
    private UUID influencerId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "rating")
    private BigDecimal rating;

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
