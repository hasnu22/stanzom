package com.stanzom.domain.notification.dto;

public record UpdateNotificationSettingsRequest(
        Boolean pushEnabled,
        Boolean predictionAlerts,
        Boolean eventAlerts,
        Boolean prizeAlerts,
        Boolean socialAlerts
) {
}
