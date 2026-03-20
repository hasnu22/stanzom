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
public class FanRoomWebSocketHandler {

    private final WebSocketMessageBroker messageBroker;

    @MessageMapping("/fanroom/{roomId}/message")
    public void handleMessage(@DestinationVariable UUID roomId, @Payload ChatMessage message) {
        log.debug("Received chat message in room {} from user {}", roomId, message.getUserId());
        messageBroker.broadcastFanRoomMessage(roomId, message);
    }

    @MessageMapping("/fanroom/{roomId}/join")
    public void handleJoin(@DestinationVariable UUID roomId, @Payload PresenceMessage message) {
        log.debug("User {} joined room {}", message.getUserId(), roomId);
        message.setAction("JOIN");
        messageBroker.broadcastFanRoomPresence(roomId, message);
    }

    @MessageMapping("/fanroom/{roomId}/leave")
    public void handleLeave(@DestinationVariable UUID roomId, @Payload PresenceMessage message) {
        log.debug("User {} left room {}", message.getUserId(), roomId);
        message.setAction("LEAVE");
        messageBroker.broadcastFanRoomPresence(roomId, message);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private UUID userId;
        private String content;
        private String messageType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PresenceMessage {
        private UUID userId;
        private String action;
    }
}
