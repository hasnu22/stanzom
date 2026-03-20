package com.stanzom.domain.sport;

import com.stanzom.domain.sport.dto.SportDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SportMapper {

    SportDto toDto(Sport sport);

    List<SportDto> toDtoList(List<Sport> sports);
}
