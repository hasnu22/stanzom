package com.stanzom.domain.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "mobile_number", length = 15, unique = true, nullable = false)
    private String mobileNumber;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "username", length = 50, unique = true)
    private String username;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Builder.Default
    @Column(name = "country")
    private String country = "India";

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "favorite_team_id")
    private UUID favoriteTeamId;

    @Column(name = "favorite_sport_id")
    private UUID favoriteSportId;

    @Builder.Default
    @Column(name = "season_points")
    private int seasonPoints = 0;

    @Column(name = "season_accuracy", precision = 5, scale = 2)
    private BigDecimal seasonAccuracy;

    @Builder.Default
    @Column(name = "active_days")
    private int activeDays = 0;

    @Column(name = "referral_code", length = 20, unique = true)
    private String referralCode;

    @Column(name = "referred_by")
    private UUID referredBy;

    @Builder.Default
    @Column(name = "is_influencer")
    private Boolean isInfluencer = false;

    @Builder.Default
    @Column(name = "influencer_verified")
    private Boolean influencerVerified = false;

    @Column(name = "fcm_token")
    private String fcmToken;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
