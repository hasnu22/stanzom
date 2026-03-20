package com.stanzom.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class EventWebSocketHandler {

    private final WebSocketMessageBroker messageBroker;

    @MessageMapping("/event/{eventId}/reaction")
    public void handleReaction(@DestinationVariable UUID eventId, @Payload ReactionMessage message) {
        log.debug("Received reaction for event {}: {} from user {}", eventId, message.getEmoji(), message.getUserId());
        messageBroker.broadcastEventReaction(eventId, message);
    }

    @MessageMapping("/event/{eventId}/buzz")
    public void handleBuzzPost(@DestinationVariable UUID eventId, @Payload BuzzMessage message) {
        log.debug("Received buzz post for event {} from user {}", eventId, message.getUserId());
        messageBroker.broadcastEventBuzz(eventId, message);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReactionMessage {
        private String emoji;
        private UUID userId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuzzMessage {
        private String content;
        private String postType;
        private UUID userId;
    }
}
