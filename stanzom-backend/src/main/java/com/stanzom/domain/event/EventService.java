package com.stanzom.domain.event;

import com.stanzom.domain.event.dto.*;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final EventReactionRepository eventReactionRepository;
    private final EventBuzzPostRepository eventBuzzPostRepository;
    private final EventRatingRepository eventRatingRepository;
    private final EventMapper eventMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public Page<EventDto> getEvents(List<String> statuses, String sportSlug, String tournamentSlug, Pageable pageable) {
        return eventRepository.findByFilters(statuses, sportSlug, tournamentSlug, pageable)
                .map(eventMapper::toDto);
    }

    @Transactional(readOnly = true)
    public EventDetailDto getEventById(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        BigDecimal averageRating = eventRatingRepository.getAverageRatingByEventId(id);
        List<ReactionSummaryDto> reactionsSummary = getReactionsSummary(id);

        EventDto dto = eventMapper.toDto(event);

        return new EventDetailDto(
                dto.id(),
                dto.sportId(),
                dto.sportName(),
                dto.tournamentId(),
                dto.tournamentName(),
                dto.eventType(),
                dto.title(),
                dto.teamHomeId(),
                dto.teamAwayId(),
                dto.eventDate(),
                dto.venue(),
                dto.status(),
                dto.scoreHome(),
                dto.scoreAway(),
                dto.winnerTeamId(),
                dto.metadata(),
                dto.currentPeriod(),
                dto.createdAt(),
                averageRating,
                reactionsSummary
        );
    }

    public EventDto updateEvent(UUID id, UpdateEventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        if (request.status() != null) event.setStatus(request.status());
        if (request.scoreHome() != null) event.setScoreHome(request.scoreHome());
        if (request.scoreAway() != null) event.setScoreAway(request.scoreAway());
        if (request.winnerTeamId() != null) event.setWinnerTeamId(request.winnerTeamId());
        if (request.currentPeriod() != null) event.setCurrentPeriod(request.currentPeriod());
        if (request.metadata() != null) event.setMetadata(request.metadata());

        Event savedEvent = eventRepository.save(event);
        EventDto dto = eventMapper.toDto(savedEvent);

        // Broadcast score update via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/event/" + id + "/score",
                Map.of(
                        "eventId", id,
                        "scoreHome", dto.scoreHome() != null ? dto.scoreHome() : "",
                        "scoreAway", dto.scoreAway() != null ? dto.scoreAway() : "",
                        "status", dto.status(),
                        "currentPeriod", dto.currentPeriod() != null ? dto.currentPeriod() : ""
                )
        );

        return dto;
    }

    public void addReaction(UUID eventId, UUID userId, CreateReactionRequest request) {
        EventReaction reaction = EventReaction.builder()
                .eventId(eventId)
                .userId(userId)
                .emoji(request.emoji())
                .build();
        eventReactionRepository.save(reaction);
    }

    @Transactional(readOnly = true)
    public List<ReactionSummaryDto> getReactionsSummary(UUID eventId) {
        return eventReactionRepository.getEmojiCountsByEventId(eventId).stream()
                .map(row -> new ReactionSummaryDto((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());
    }

    public BuzzPostDto addBuzzPost(UUID eventId, UUID userId, CreateBuzzPostRequest request) {
        EventBuzzPost buzzPost = EventBuzzPost.builder()
                .eventId(eventId)
                .userId(userId)
                .content(request.content())
                .postType(request.postType())
                .eventMoment(request.eventMoment())
                .build();
        EventBuzzPost saved = eventBuzzPostRepository.save(buzzPost);
        return eventMapper.toBuzzPostDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<BuzzPostDto> getBuzzPosts(UUID eventId, String type, Pageable pageable) {
        if (type != null && !type.isBlank()) {
            return eventBuzzPostRepository.findByEventIdAndPostTypeOrderByCreatedAtDesc(eventId, type, pageable)
                    .map(eventMapper::toBuzzPostDto);
        }
        return eventBuzzPostRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable)
                .map(eventMapper::toBuzzPostDto);
    }

    @Transactional(readOnly = true)
    public Page<BuzzPostDto> getMoments(UUID eventId) {
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "likesCount"));
        return eventBuzzPostRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable)
                .map(eventMapper::toBuzzPostDto);
    }

    public void rateEvent(UUID eventId, UUID userId, RateEventRequest request) {
        EventRating rating = eventRatingRepository.findByEventIdAndUserId(eventId, userId)
                .orElse(EventRating.builder()
                        .eventId(eventId)
                        .userId(userId)
                        .build());

        rating.setRating(request.rating());
        rating.setReviewText(request.reviewText());
        eventRatingRepository.save(rating);
    }

    @Transactional(readOnly = true)
    public EventRatingDto getEventRating(UUID eventId, UUID userId) {
        BigDecimal averageRating = eventRatingRepository.getAverageRatingByEventId(eventId);
        int totalRatings = eventRatingRepository.countByEventId(eventId);

        BigDecimal userRating = null;
        if (userId != null) {
            userRating = eventRatingRepository.findByEventIdAndUserId(eventId, userId)
                    .map(EventRating::getRating)
                    .orElse(null);
        }

        return new EventRatingDto(averageRating, totalRatings, userRating);
    }
}
