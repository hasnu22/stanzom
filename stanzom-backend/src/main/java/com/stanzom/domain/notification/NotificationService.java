package com.stanzom.domain.notification;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.stanzom.domain.notification.dto.NotificationDto;
import com.stanzom.domain.notification.dto.NotificationSettingsDto;
import com.stanzom.domain.notification.dto.UpdateNotificationSettingsRequest;
import com.stanzom.domain.user.User;
import com.stanzom.domain.user.UserRepository;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toDto);
    }

    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalStateException("Cannot mark another user's notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public NotificationSettingsDto getSettings(UUID userId) {
        NotificationSettings settings = notificationSettingsRepository.findByUserId(userId)
                .orElseGet(() -> NotificationSettings.builder().userId(userId).build());
        return notificationMapper.toSettingsDto(settings);
    }

    public NotificationSettingsDto updateSettings(UUID userId, UpdateNotificationSettingsRequest request) {
        NotificationSettings settings = notificationSettingsRepository.findByUserId(userId)
                .orElseGet(() -> NotificationSettings.builder().userId(userId).build());

        if (request.pushEnabled() != null) {
            settings.setPushEnabled(request.pushEnabled());
        }
        if (request.predictionAlerts() != null) {
            settings.setPredictionAlerts(request.predictionAlerts());
        }
        if (request.eventAlerts() != null) {
            settings.setEventAlerts(request.eventAlerts());
        }
        if (request.prizeAlerts() != null) {
            settings.setPrizeAlerts(request.prizeAlerts());
        }
        if (request.socialAlerts() != null) {
            settings.setSocialAlerts(request.socialAlerts());
        }

        notificationSettingsRepository.save(settings);
        return notificationMapper.toSettingsDto(settings);
    }

    public void sendNotification(UUID userId, String title, String message, String type, String referenceId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);

        // Optionally send FCM push notification
        userRepository.findById(userId).ifPresent(user -> {
            if (user.getFcmToken() != null && !user.getFcmToken().isBlank()) {
                NotificationSettings settings = notificationSettingsRepository.findByUserId(userId)
                        .orElse(null);
                if (settings == null || settings.isPushEnabled()) {
                    sendFcmNotification(user.getFcmToken(), title, message);
                }
            }
        });
    }

    public void sendFcmNotification(String fcmToken, String title, String body) {
        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(com.google.firebase.messaging.Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            FirebaseMessaging.getInstance().send(message);
            log.debug("FCM notification sent successfully to token: {}", fcmToken.substring(0, 10) + "...");
        } catch (FirebaseMessagingException e) {
            log.warn("Failed to send FCM notification: {}", e.getMessage());
        } catch (IllegalStateException e) {
            log.warn("Firebase not initialized. Skipping FCM notification.");
        }
    }
}
