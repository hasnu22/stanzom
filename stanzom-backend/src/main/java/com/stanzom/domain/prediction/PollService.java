package com.stanzom.domain.prediction;

import com.stanzom.domain.prediction.dto.PollDto;
import com.stanzom.domain.prediction.dto.PollResultDto;
import com.stanzom.domain.prediction.dto.PollVoteRequest;
import com.stanzom.shared.BadRequestException;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PollService {

    private final PollRepository pollRepository;
    private final PollVoteRepository pollVoteRepository;
    private final PredictionMapper predictionMapper;

    @Transactional(readOnly = true)
    public List<PollDto> getPolls(UUID eventId) {
        List<Poll> polls = pollRepository.findByEventIdAndIsActiveTrue(eventId);
        return predictionMapper.toPollDtoList(polls);
    }

    @Transactional
    public PollResultDto vote(UUID userId, UUID pollId, PollVoteRequest request) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll", "id", pollId));

        pollVoteRepository.findByPollIdAndUserId(pollId, userId)
                .ifPresent(existing -> {
                    throw new BadRequestException("You have already voted on this poll");
                });

        PollVote vote = PollVote.builder()
                .pollId(pollId)
                .userId(userId)
                .optionId(request.optionId())
                .build();

        pollVoteRepository.save(vote);

        return getPollResults(pollId, userId);
    }

    @Transactional(readOnly = true)
    public PollResultDto getPollResults(UUID pollId, UUID userId) {
        pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll", "id", pollId));

        List<Object[]> voteCounts = pollVoteRepository.countVotesGroupedByOptionId(pollId);

        Map<String, Long> voteCountMap = new HashMap<>();
        long totalVotes = 0;
        for (Object[] row : voteCounts) {
            String optionId = (String) row[0];
            Long count = (Long) row[1];
            voteCountMap.put(optionId, count);
            totalVotes += count;
        }

        String userVotedOptionId = pollVoteRepository.findByPollIdAndUserId(pollId, userId)
                .map(PollVote::getOptionId)
                .orElse(null);

        return new PollResultDto(pollId, voteCountMap, userVotedOptionId, totalVotes);
    }
}
