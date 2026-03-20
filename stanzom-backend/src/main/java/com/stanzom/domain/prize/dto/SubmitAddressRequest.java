package com.stanzom.domain.prize.dto;

public record SubmitAddressRequest(
        String fullName,
        String mobileNumber,
        String streetAddress,
        String city,
        String state,
        String pincode
) {
}
