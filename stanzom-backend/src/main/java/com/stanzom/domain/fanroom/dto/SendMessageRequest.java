package com.stanzom.domain.fanroom.dto;

public record SendMessageRequest(
        String content,
        String messageType
) {
}
