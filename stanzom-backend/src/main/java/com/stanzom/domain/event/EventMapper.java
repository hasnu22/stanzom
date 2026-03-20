package com.stanzom.domain.event;

import com.stanzom.domain.event.dto.BuzzPostDto;
import com.stanzom.domain.event.dto.EventDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapper {

    @Mapping(source = "sport.id", target = "sportId")
    @Mapping(source = "sport.name", target = "sportName")
    @Mapping(source = "tournament.id", target = "tournamentId")
    @Mapping(source = "tournament.name", target = "tournamentName")
    EventDto toDto(Event event);

    List<EventDto> toDtoList(List<Event> events);

    @Mapping(target = "userName", ignore = true)
    BuzzPostDto toBuzzPostDto(EventBuzzPost buzzPost);

    List<BuzzPostDto> toBuzzPostDtoList(List<EventBuzzPost> buzzPosts);
}
