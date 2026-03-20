package com.stanzom.domain.user.dto;

public record AuthTokenResponse(
        String accessToken,
        String refreshToken
) {
}
