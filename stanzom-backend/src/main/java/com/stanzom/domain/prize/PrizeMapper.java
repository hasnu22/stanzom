package com.stanzom.domain.prize;

import com.stanzom.domain.prize.dto.DailyPrizeDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PrizeMapper {

    @Mapping(target = "winnerName", ignore = true)
    DailyPrizeDto toDto(DailyPrize dailyPrize);
}
