package com.stanzom.domain.reward;

import com.stanzom.domain.reward.dto.RewardTransactionDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RewardMapper {

    RewardTransactionDto toDto(RewardTransaction rewardTransaction);

    List<RewardTransactionDto> toDtoList(List<RewardTransaction> transactions);
}
