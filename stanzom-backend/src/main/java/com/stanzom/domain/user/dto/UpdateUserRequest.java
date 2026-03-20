package com.stanzom.domain.user.dto;

import java.util.UUID;

public record UpdateUserRequest(
        String name,
        String username,
        String city,
        String state,
        String country,
        String profileImageUrl,
        UUID favoriteTeamId,
        UUID favoriteSportId,
        String fcmToken
) {
}
