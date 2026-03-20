package com.stanzom.domain.team;

import com.stanzom.domain.team.dto.TeamDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TeamMapper {

    @Mapping(target = "sportName", ignore = true)
    TeamDto toDto(Team team);

    List<TeamDto> toDtoList(List<Team> teams);
}
