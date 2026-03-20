package com.stanzom.domain.notification;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "notification_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false)
    private UUID userId;

    @Builder.Default
    @Column(name = "push_enabled")
    private boolean pushEnabled = true;

    @Builder.Default
    @Column(name = "prediction_alerts")
    private boolean predictionAlerts = true;

    @Builder.Default
    @Column(name = "event_alerts")
    private boolean eventAlerts = true;

    @Builder.Default
    @Column(name = "prize_alerts")
    private boolean prizeAlerts = true;

    @Builder.Default
    @Column(name = "social_alerts")
    private boolean socialAlerts = true;
}
