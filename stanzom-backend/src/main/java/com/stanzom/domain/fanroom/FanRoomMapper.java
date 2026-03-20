package com.stanzom.domain.fanroom;

import com.stanzom.domain.fanroom.dto.FanRoomDto;
import com.stanzom.domain.fanroom.dto.FanRoomInviteDto;
import com.stanzom.domain.fanroom.dto.FanRoomMessageDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FanRoomMapper {

    @Mapping(target = "memberCount", ignore = true)
    FanRoomDto toDto(FanRoom fanRoom);

    FanRoomInviteDto toInviteDto(FanRoomInvite invite);

    @Mapping(target = "userName", ignore = true)
    FanRoomMessageDto toMessageDto(FanRoomMessage message);
}
