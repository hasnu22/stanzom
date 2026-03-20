package com.stanzom.domain.reward.dto;

import java.util.List;

public record ReferralInfoDto(
        String referralCode,
        int totalReferrals,
        int totalPointsFromReferrals,
        List<ReferralDto> referrals
) {
}
