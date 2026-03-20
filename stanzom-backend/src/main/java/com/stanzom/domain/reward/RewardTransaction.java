package com.stanzom.domain.reward;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reward_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "points", nullable = false)
    private int points;

    @Column(name = "transaction_type", length = 50)
    private String transactionType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
