package com.stanzom.domain.influencer;

import com.stanzom.domain.influencer.dto.*;
import com.stanzom.domain.player.UserFollow;
import com.stanzom.domain.player.UserFollowRepository;
import com.stanzom.domain.sport.Sport;
import com.stanzom.domain.sport.SportRepository;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InfluencerService {

    private final InfluencerRepository influencerRepository;
    private final InfluencerRatingRepository influencerRatingRepository;
    private final InfluencerApplicationRepository influencerApplicationRepository;
    private final UserFollowRepository userFollowRepository;
    private final InfluencerMapper influencerMapper;
    private final SportRepository sportRepository;

    public Page<InfluencerDto> getInfluencers(String sportSlug, String niche, Boolean featured, Pageable pageable) {
        Page<Influencer> page = influencerRepository.findWithFilters(featured, pageable);

        // Filter by sportSlug and niche in-memory since sports is a UUID[] array
        // and niche is a String[] array, which JPQL cannot query with IN/JOIN
        UUID sportId = null;
        if (sportSlug != null) {
            sportId = sportRepository.findBySlug(sportSlug)
                    .map(Sport::getId)
                    .orElse(null);
        }

        final UUID resolvedSportId = sportId;
        List<Influencer> filtered = page.getContent().stream()
                .filter(i -> {
                    if (resolvedSportId != null && i.getSports() != null) {
                        return Arrays.asList(i.getSports()).contains(resolvedSportId);
                    }
                    return resolvedSportId == null;
                })
                .filter(i -> {
                    if (niche != null && i.getNiche() != null) {
                        return Arrays.asList(i.getNiche()).contains(niche);
                    }
                    return niche == null;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(filtered, pageable, filtered.size())
                .map(influencerMapper::toDto);
    }

    public InfluencerDetailDto getInfluencerById(UUID id) {
        Influencer influencer = influencerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Influencer", "id", id.toString()));

        InfluencerDetailDto dto = influencerMapper.toDetailDto(influencer);
        return new InfluencerDetailDto(
                dto.id(),
                dto.userId(),
                dto.displayName(),
                dto.handle(),
                dto.bio(),
                dto.sports(),
                dto.niche(),
                dto.platform(),
                dto.followersCount(),
                dto.socialUrl(),
                dto.isVerified(),
                dto.isFeatured(),
                dto.featuredOrder(),
                dto.likesCount(),
                dto.overallRating(),
                dto.ratingCount(),
                dto.createdAt(),
                null // userRating resolved per-request if needed
        );
    }

    @Transactional
    public void followInfluencer(UUID userId, UUID influencerId) {
        Influencer influencer = influencerRepository.findById(influencerId)
                .orElseThrow(() -> new ResourceNotFoundException("Influencer", "id", influencerId.toString()));

        if (userFollowRepository.existsByUserIdAndEntityTypeAndEntityId(userId, "INFLUENCER", influencerId)) {
            return;
        }

        UserFollow follow = UserFollow.builder()
                .userId(userId)
                .entityType("INFLUENCER")
                .entityId(influencerId)
                .build();
        userFollowRepository.save(follow);
    }

    @Transactional
    public void likeInfluencer(UUID userId, UUID influencerId) {
        Influencer influencer = influencerRepository.findById(influencerId)
                .orElseThrow(() -> new ResourceNotFoundException("Influencer", "id", influencerId.toString()));

        influencer.setLikesCount(influencer.getLikesCount() + 1);
        influencerRepository.save(influencer);
    }

    @Transactional
    public void rateInfluencer(UUID userId, UUID influencerId, RateInfluencerRequest request) {
        Influencer influencer = influencerRepository.findById(influencerId)
                .orElseThrow(() -> new ResourceNotFoundException("Influencer", "id", influencerId.toString()));

        InfluencerRating rating = influencerRatingRepository.findByInfluencerIdAndUserId(influencerId, userId)
                .orElse(InfluencerRating.builder()
                        .influencerId(influencerId)
                        .userId(userId)
                        .build());

        rating.setRating(request.rating());
        rating.setReviewText(request.reviewText());
        influencerRatingRepository.save(rating);

        BigDecimal averageRating = influencerRatingRepository.findAverageRatingByInfluencerId(influencerId);
        long ratingCount = influencerRatingRepository.countByInfluencerId(influencerId);
        influencer.setOverallRating(averageRating != null ? averageRating : BigDecimal.ZERO);
        influencer.setRatingCount((int) ratingCount);
        influencerRepository.save(influencer);
    }

    @Transactional
    public InfluencerApplicationDto apply(UUID userId, ApplyInfluencerRequest request) {
        InfluencerApplication application = InfluencerApplication.builder()
                .userId(userId)
                .niche(request.niche() != null ? request.niche().toArray(new String[0]) : null)
                .sports(request.sports() != null ? request.sports().toArray(new UUID[0]) : null)
                .bio(request.bio())
                .socialHandle(request.socialHandle())
                .status("PENDING")
                .build();

        application = influencerApplicationRepository.save(application);
        return influencerMapper.toApplicationDto(application);
    }

    public List<InfluencerApplicationDto> getApplications() {
        List<InfluencerApplication> applications = influencerApplicationRepository.findAll();
        return influencerMapper.toApplicationDtoList(applications);
    }

    @Transactional
    public InfluencerApplicationDto updateApplication(UUID applicationId, UUID adminUserId, UpdateApplicationRequest request) {
        InfluencerApplication application = influencerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("InfluencerApplication", "id", applicationId.toString()));

        application.setStatus(request.status());
        application.setReviewedBy(adminUserId);
        application.setReviewedAt(OffsetDateTime.now());
        application = influencerApplicationRepository.save(application);

        if ("APPROVED".equals(request.status())) {
            Influencer influencer = Influencer.builder()
                    .userId(application.getUserId())
                    .displayName(application.getSocialHandle())
                    .handle(application.getSocialHandle())
                    .bio(application.getBio())
                    .sports(application.getSports())
                    .niche(application.getNiche())
                    .build();
            influencerRepository.save(influencer);

            // TODO: Update user.is_influencer = true via UserRepository
        }

        return influencerMapper.toApplicationDto(application);
    }
}
