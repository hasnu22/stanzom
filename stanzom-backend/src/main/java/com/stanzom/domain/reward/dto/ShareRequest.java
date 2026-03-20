package com.stanzom.domain.reward.dto;

public record ShareRequest(
        String platform,
        String contentType,
        String contentId
) {
}
