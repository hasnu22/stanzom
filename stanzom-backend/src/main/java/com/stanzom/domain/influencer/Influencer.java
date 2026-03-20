package com.stanzom.domain.influencer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "influencers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Influencer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "handle", length = 100)
    private String handle;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "uuid[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private UUID[] sports;

    @Column(columnDefinition = "varchar(50)[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] niche;

    @Column(name = "platform", length = 50)
    private String platform;

    @Column(name = "followers_count", length = 20)
    private String followersCount;

    @Column(name = "social_url", columnDefinition = "TEXT")
    private String socialUrl;

    @Column(name = "is_verified")
    @Builder.Default
    private boolean isVerified = false;

    @Column(name = "is_featured")
    @Builder.Default
    private boolean isFeatured = false;

    @Column(name = "featured_order")
    private Integer featuredOrder;

    @Column(name = "likes_count")
    @Builder.Default
    private int likesCount = 0;

    @Column(name = "overall_rating")
    @Builder.Default
    private BigDecimal overallRating = BigDecimal.ZERO;

    @Column(name = "rating_count")
    @Builder.Default
    private int ratingCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
