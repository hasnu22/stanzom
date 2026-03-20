package com.stanzom.domain.user;

import com.stanzom.domain.user.dto.UpdateUserRequest;
import com.stanzom.domain.user.dto.UserDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromRequest(UpdateUserRequest request, @MappingTarget User user);
}
