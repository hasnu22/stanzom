package com.stanzom.domain.prediction;

import com.stanzom.domain.prediction.dto.PollDto;
import com.stanzom.domain.prediction.dto.PredictionQuestionDto;
import com.stanzom.domain.prediction.dto.UserPredictionDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PredictionMapper {

    PredictionQuestionDto toQuestionDto(PredictionQuestion question);

    List<PredictionQuestionDto> toQuestionDtoList(List<PredictionQuestion> questions);

    UserPredictionDto toUserPredictionDto(UserPrediction prediction);

    List<UserPredictionDto> toUserPredictionDtoList(List<UserPrediction> predictions);

    PollDto toPollDto(Poll poll);

    List<PollDto> toPollDtoList(List<Poll> polls);
}
