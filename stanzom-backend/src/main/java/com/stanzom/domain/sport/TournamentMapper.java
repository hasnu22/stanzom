package com.stanzom.domain.sport;

import com.stanzom.domain.sport.dto.TournamentDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TournamentMapper {

    @Mapping(source = "sport.id", target = "sportId")
    @Mapping(source = "sport.name", target = "sportName")
    TournamentDto toDto(Tournament tournament);

    List<TournamentDto> toDtoList(List<Tournament> tournaments);
}
