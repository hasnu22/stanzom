package com.stanzom.domain.notification.dto;

public record NotificationSettingsDto(
        boolean pushEnabled,
        boolean predictionAlerts,
        boolean eventAlerts,
        boolean prizeAlerts,
        boolean socialAlerts
) {
}
