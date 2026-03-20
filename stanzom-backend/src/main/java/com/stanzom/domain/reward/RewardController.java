package com.stanzom.domain.reward;

import com.stanzom.domain.reward.dto.*;
import com.stanzom.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
@Tag(name = "Rewards", description = "Reward transactions, referrals, and sharing endpoints")
public class RewardController {

    private final RewardService rewardService;

    @GetMapping("/my")
    @Operation(summary = "Get my reward transactions", description = "Returns all reward transactions for the authenticated user")
    public ResponseEntity<ApiResponse<List<RewardTransactionDto>>> getMyRewards() {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(rewardService.getMyRewards(userId)));
    }

    @GetMapping("/referral")
    @Operation(summary = "Get referral info", description = "Returns referral code, count, and details for the authenticated user")
    public ResponseEntity<ApiResponse<ReferralInfoDto>> getReferralInfo() {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(rewardService.getReferralInfo(userId)));
    }

    @PostMapping("/share")
    @Operation(summary = "Log a share action", description = "Logs a content share and awards points based on platform")
    public ResponseEntity<ApiResponse<ShareResponseDto>> logShare(@RequestBody ShareRequest request) {
        UUID userId = UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(ApiResponse.success(rewardService.logShare(userId, request)));
    }
}
