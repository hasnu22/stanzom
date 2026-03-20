package com.stanzom.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SendOtpRequest(
        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^\\+?\\d{7,15}$", message = "Invalid mobile number format")
        String mobileNumber
) {
}
