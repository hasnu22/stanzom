package com.stanzom.domain.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String OTP_PREFIX = "otp:";
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RedisTemplate<String, String> redisTemplate;

    public String generateAndStoreOtp(String mobileNumber) {
        String otp = String.format("%06d", RANDOM.nextInt(999999));
        String key = OTP_PREFIX + mobileNumber;
        redisTemplate.opsForValue().set(key, otp, OTP_TTL);
        log.info("OTP generated for mobile: {}", mobileNumber);
        return otp;
    }

    public boolean verifyOtp(String mobileNumber, String otp) {
        String key = OTP_PREFIX + mobileNumber;
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }
}
