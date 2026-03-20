package com.stanzom.domain.pundit;

import com.stanzom.domain.pundit.dto.PunditPostDto;
import com.stanzom.domain.pundit.dto.PunditPostPickDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PunditMapper {

    @Mapping(target = "userName", ignore = true)
    @Mapping(target = "picks", ignore = true)
    PunditPostDto toDto(PunditPost post);

    PunditPostPickDto toPickDto(PunditPostPick pick);

    List<PunditPostPickDto> toPickDtoList(List<PunditPostPick> picks);
}
