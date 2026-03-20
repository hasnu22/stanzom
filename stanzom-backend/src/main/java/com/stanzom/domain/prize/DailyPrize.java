package com.stanzom.domain.prize;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_prizes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPrize {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "sport_id")
    private UUID sportId;

    @Column(name = "winner_user_id")
    private UUID winnerUserId;

    @Column(name = "points_scored")
    private Integer pointsScored;

    @Column(name = "prediction_accuracy", precision = 5, scale = 2)
    private BigDecimal predictionAccuracy;

    @Column(name = "prize_description", columnDefinition = "TEXT")
    private String prizeDescription;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "PENDING";

    @Column(name = "prize_date")
    private LocalDate prizeDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
