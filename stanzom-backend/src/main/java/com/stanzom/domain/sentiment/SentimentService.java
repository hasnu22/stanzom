package com.stanzom.domain.sentiment;

import com.stanzom.domain.sentiment.dto.*;
import com.stanzom.domain.user.User;
import com.stanzom.domain.user.UserRepository;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SentimentService {

    private final SentimentVoteRepository sentimentVoteRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SentimentSummaryDto getSentiment(UUID eventId, UUID userId) {
        long totalVotes = sentimentVoteRepository.countByEventId(eventId);

        Map<UUID, Long> teamVotes = sentimentVoteRepository.countVotesGroupedByTeam(eventId)
                .stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> (Long) row[1]
                ));

        UUID userVotedTeamId = sentimentVoteRepository.findByEventIdAndUserId(eventId, userId)
                .map(SentimentVote::getTeamId)
                .orElse(null);

        return new SentimentSummaryDto(eventId, totalVotes, teamVotes, userVotedTeamId);
    }

    public SentimentSummaryDto vote(UUID eventId, UUID userId, SentimentVoteRequest request) {
        sentimentVoteRepository.findByEventIdAndUserId(eventId, userId)
                .ifPresent(v -> {
                    throw new IllegalStateException("User has already voted for this event");
                });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SentimentVote vote = SentimentVote.builder()
                .eventId(eventId)
                .userId(userId)
                .teamId(request.teamId())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .build();
        sentimentVoteRepository.save(vote);

        return getSentiment(eventId, userId);
    }

    @Transactional(readOnly = true)
    public SentimentMapDto getSentimentMap(UUID eventId) {
        List<Object[]> cityData = sentimentVoteRepository.countVotesGroupedByTeamAndCity(eventId);

        List<SentimentRegionDto> regions = cityData.stream()
                .map(row -> new SentimentRegionDto(
                        (String) row[1],
                        null,
                        (UUID) row[0],
                        (Long) row[2]
                ))
                .toList();

        return new SentimentMapDto(eventId, regions);
    }
}
