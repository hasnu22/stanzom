package com.stanzom.domain.reward;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "referrals", uniqueConstraints = @UniqueConstraint(columnNames = {"referred_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "referrer_id", nullable = false)
    private UUID referrerId;

    @Column(name = "referred_id", nullable = false)
    private UUID referredId;

    @Column(name = "referral_code", length = 20)
    private String referralCode;

    @Builder.Default
    @Column(name = "points_awarded")
    private int pointsAwarded = 50;

    @Column(name = "downloaded_at")
    private OffsetDateTime downloadedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
