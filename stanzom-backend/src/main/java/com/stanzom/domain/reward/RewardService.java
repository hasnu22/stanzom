package com.stanzom.domain.reward;

import com.stanzom.domain.reward.dto.*;
import com.stanzom.domain.user.User;
import com.stanzom.domain.user.UserRepository;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RewardService {

    private final RewardTransactionRepository rewardTransactionRepository;
    private final ReferralRepository referralRepository;
    private final ShareLogRepository shareLogRepository;
    private final UserRepository userRepository;
    private final RewardMapper rewardMapper;

    @Value("${stanzom.share-points.wa:10}")
    private int sharePointsWa;

    @Value("${stanzom.share-points.x:15}")
    private int sharePointsX;

    @Value("${stanzom.share-points.sc:10}")
    private int sharePointsSc;

    @Transactional(readOnly = true)
    public List<RewardTransactionDto> getMyRewards(UUID userId) {
        List<RewardTransaction> transactions = rewardTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return rewardMapper.toDtoList(transactions);
    }

    @Transactional(readOnly = true)
    public ReferralInfoDto getReferralInfo(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Referral> referrals = referralRepository.findByReferrerId(userId);

        int totalPoints = referrals.stream().mapToInt(Referral::getPointsAwarded).sum();

        List<ReferralDto> referralDtos = referrals.stream()
                .map(r -> {
                    String referredName = userRepository.findById(r.getReferredId())
                            .map(User::getName)
                            .orElse("Unknown");
                    return new ReferralDto(
                            r.getId(),
                            r.getReferredId(),
                            referredName,
                            r.getPointsAwarded(),
                            r.getCreatedAt()
                    );
                })
                .toList();

        return new ReferralInfoDto(
                user.getReferralCode(),
                referrals.size(),
                totalPoints,
                referralDtos
        );
    }

    public ShareResponseDto logShare(UUID userId, ShareRequest request) {
        int points = determineSharePoints(request.platform());

        ShareLog shareLog = ShareLog.builder()
                .userId(userId)
                .platform(request.platform())
                .contentType(request.contentType())
                .contentId(request.contentId())
                .pointsAwarded(points)
                .build();
        shareLogRepository.save(shareLog);

        RewardTransaction transaction = RewardTransaction.builder()
                .userId(userId)
                .points(points)
                .transactionType("SHARE")
                .description("Shared via " + request.platform())
                .referenceId(shareLog.getId().toString())
                .build();
        rewardTransactionRepository.save(transaction);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setSeasonPoints(user.getSeasonPoints() + points);
        userRepository.save(user);

        return new ShareResponseDto(points, "Successfully shared! You earned " + points + " points.");
    }

    private int determineSharePoints(String platform) {
        return switch (platform.toLowerCase()) {
            case "wa", "whatsapp" -> sharePointsWa;
            case "x", "twitter" -> sharePointsX;
            case "sc", "snapchat" -> sharePointsSc;
            default -> 5;
        };
    }
}
