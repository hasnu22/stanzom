package com.stanzom.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketMessageBroker {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastEventScore(UUID eventId, Object scoreUpdate) {
        String destination = "/topic/event/" + eventId + "/score";
        log.debug("Broadcasting score update to {}", destination);
        messagingTemplate.convertAndSend(destination, scoreUpdate);
    }

    public void broadcastEventReaction(UUID eventId, Object reactionData) {
        String destination = "/topic/event/" + eventId + "/reactions";
        log.debug("Broadcasting reaction to {}", destination);
        messagingTemplate.convertAndSend(destination, reactionData);
    }

    public void broadcastEventBuzz(UUID eventId, Object buzzPost) {
        String destination = "/topic/event/" + eventId + "/buzz";
        log.debug("Broadcasting buzz post to {}", destination);
        messagingTemplate.convertAndSend(destination, buzzPost);
    }

    public void broadcastFanRoomMessage(UUID roomId, Object message) {
        String destination = "/topic/fanroom/" + roomId + "/messages";
        log.debug("Broadcasting fan room message to {}", destination);
        messagingTemplate.convertAndSend(destination, message);
    }

    public void broadcastFanRoomPresence(UUID roomId, Object presenceData) {
        String destination = "/topic/fanroom/" + roomId + "/presence";
        log.debug("Broadcasting fan room presence to {}", destination);
        messagingTemplate.convertAndSend(destination, presenceData);
    }

    public void sendUserNotification(String userId, Object notification) {
        String destination = "/user/" + userId + "/queue/notifications";
        log.debug("Sending notification to user {}", userId);
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
    }
}
