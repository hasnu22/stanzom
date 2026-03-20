package com.stanzom.domain.fanroom.dto;

import java.util.UUID;

public record InviteContactRequest(
        UUID userId,
        String mobileNumber
) {
}
