package com.stanzom.domain.player;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "players")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sport_id", nullable = false)
    private UUID sportId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "team_id")
    private UUID teamId;

    @Column(name = "role", length = 50)
    private String role;

    @Column(name = "country", length = 50)
    private String country;

    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    @Builder.Default
    @Column(name = "followers_count")
    private int followersCount = 0;

    @Builder.Default
    @Column(name = "likes_count")
    private int likesCount = 0;

    @Builder.Default
    @Column(name = "overall_rating")
    private BigDecimal overallRating = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "rating_count")
    private int ratingCount = 0;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "stats", columnDefinition = "jsonb")
    private String stats;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;
}
