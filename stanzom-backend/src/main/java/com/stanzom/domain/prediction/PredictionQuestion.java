package com.stanzom.domain.prediction;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "prediction_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "sport_id")
    private UUID sportId;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "question_type", length = 50)
    private String questionType;

    @Column(name = "points")
    private int points;

    @Column(name = "options", columnDefinition = "jsonb")
    private String options;

    @Column(name = "correct_option_id", length = 10)
    private String correctOptionId;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "lock_time")
    private OffsetDateTime lockTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
