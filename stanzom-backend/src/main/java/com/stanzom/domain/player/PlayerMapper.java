package com.stanzom.domain.player;

import com.stanzom.domain.player.dto.PlayerDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlayerMapper {

    @Mapping(target = "teamName", ignore = true)
    @Mapping(target = "sportName", ignore = true)
    PlayerDto toDto(Player player);

    List<PlayerDto> toDtoList(List<Player> players);
}
