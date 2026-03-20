package com.stanzom.domain.influencer.dto;

import java.util.List;
import java.util.UUID;

public record ApplyInfluencerRequest(
        List<String> niche,
        List<UUID> sports,
        String bio,
        String socialHandle
) {
}
