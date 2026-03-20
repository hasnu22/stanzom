package com.stanzom.domain.event.dto;

public record CreateBuzzPostRequest(
        String content,
        String postType,
        String eventMoment
) {
}
