package com.stanzom.domain.prediction;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_predictions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "question_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "selected_option_id", length = 10)
    private String selectedOptionId;

    @Builder.Default
    @Column(name = "is_locked")
    private boolean isLocked = false;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Builder.Default
    @Column(name = "points_earned")
    private int pointsEarned = 0;

    @Column(name = "locked_at")
    private OffsetDateTime lockedAt;
}
