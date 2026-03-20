package com.stanzom.domain.user.dto;

public record VerifyOtpResponse(
        String accessToken,
        String refreshToken,
        UserDto user,
        boolean newUser
) {
}
