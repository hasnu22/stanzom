package com.stanzom.domain.notification;

import com.stanzom.domain.notification.dto.NotificationDto;
import com.stanzom.domain.notification.dto.NotificationSettingsDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationDto toDto(Notification notification);

    NotificationSettingsDto toSettingsDto(NotificationSettings settings);
}
