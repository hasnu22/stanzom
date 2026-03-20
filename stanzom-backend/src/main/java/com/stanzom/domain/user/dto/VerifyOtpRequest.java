package com.stanzom.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyOtpRequest(
        @NotBlank(message = "Mobile number is required")
        String mobileNumber,

        @NotBlank(message = "OTP is required")
        String otp
) {
}
