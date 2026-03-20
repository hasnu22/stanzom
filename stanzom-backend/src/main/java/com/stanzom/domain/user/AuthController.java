package com.stanzom.domain.user;

import com.stanzom.domain.user.dto.*;
import com.stanzom.security.JwtTokenProvider;
import com.stanzom.shared.ApiResponse;
import com.stanzom.shared.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "OTP-based authentication endpoints")
public class AuthController {

    private static final String TOKEN_BLACKLIST_PREFIX = "blacklist:";
    private static final Duration TOKEN_BLACKLIST_TTL = Duration.ofHours(24);

    private final OtpService otpService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UserMapper userMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP", description = "Sends a 6-digit OTP to the provided mobile number")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OTP sent successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid mobile number")
    })
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        String otp = otpService.generateAndStoreOtp(request.mobileNumber());
        log.info("OTP sent to {}: {}", request.mobileNumber(), otp); // Remove in production
        // DEV ONLY: return OTP in response so app can show it
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully. Dev OTP: " + otp, null));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP", description = "Verifies OTP and returns JWT tokens. Creates user if not exists.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OTP verified, tokens returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired OTP")
    })
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        boolean valid = otpService.verifyOtp(request.mobileNumber(), request.otp());
        if (!valid) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        boolean isNewUser = false;
        User user = userRepository.findByMobileNumber(request.mobileNumber())
                .orElse(null);

        if (user == null) {
            isNewUser = true;
            user = User.builder()
                    .mobileNumber(request.mobileNumber())
                    .referralCode(userService.generateReferralCode())
                    .build();
            user = userRepository.save(user);
        }

        String accessToken = jwtTokenProvider.generateToken(user.getId().toString());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId().toString());

        UserDto userDto = userMapper.toDto(user);

        VerifyOtpResponse response = new VerifyOtpResponse(accessToken, refreshToken, userDto, isNewUser);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh tokens", description = "Returns new access and refresh tokens using a valid refresh token")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "New tokens returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid refresh token")
    })
    public ResponseEntity<ApiResponse<AuthTokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String token = request.refreshToken();

        if (!jwtTokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String blacklistKey = TOKEN_BLACKLIST_PREFIX + token;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(blacklistKey))) {
            throw new BadRequestException("Refresh token has been revoked");
        }

        String userId = jwtTokenProvider.getUserIdFromToken(token);

        // Blacklist old refresh token
        redisTemplate.opsForValue().set(blacklistKey, "revoked", TOKEN_BLACKLIST_TTL);

        String newAccessToken = jwtTokenProvider.generateToken(userId);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId);

        return ResponseEntity.ok(ApiResponse.success(new AuthTokenResponse(newAccessToken, newRefreshToken)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Invalidates the current token by adding it to the blacklist")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logged out successfully")
    })
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String blacklistKey = TOKEN_BLACKLIST_PREFIX + token;
            redisTemplate.opsForValue().set(blacklistKey, "revoked", TOKEN_BLACKLIST_TTL);
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
