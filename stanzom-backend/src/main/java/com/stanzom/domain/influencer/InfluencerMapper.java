package com.stanzom.domain.influencer;

import com.stanzom.domain.influencer.dto.InfluencerApplicationDto;
import com.stanzom.domain.influencer.dto.InfluencerDetailDto;
import com.stanzom.domain.influencer.dto.InfluencerDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InfluencerMapper {

    InfluencerDto toDto(Influencer influencer);

    List<InfluencerDto> toDtoList(List<Influencer> influencers);

    @Mapping(target = "userRating", ignore = true)
    InfluencerDetailDto toDetailDto(Influencer influencer);

    InfluencerApplicationDto toApplicationDto(InfluencerApplication application);

    List<InfluencerApplicationDto> toApplicationDtoList(List<InfluencerApplication> applications);
}
