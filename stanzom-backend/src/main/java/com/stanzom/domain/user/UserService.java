package com.stanzom.domain.user;

import com.stanzom.domain.user.dto.UpdateUserRequest;
import com.stanzom.domain.user.dto.UserDto;
import com.stanzom.domain.user.dto.UserStatsDto;
import com.stanzom.shared.BadRequestException;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int REFERRAL_CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return userMapper.toDto(user);
    }

    public UserDto updateCurrentUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.username() != null && !request.username().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.username())) {
                throw new BadRequestException("Username already taken");
            }
        }

        userMapper.updateUserFromRequest(request, user);
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toDto(user);
    }

    @Transactional(readOnly = true)
    public UserStatsDto getUserStats(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // TODO: integrate with prediction service for totalPredictions and correctPredictions
        return new UserStatsDto(
                user.getSeasonPoints(),
                user.getSeasonAccuracy(),
                user.getActiveDays(),
                0L,
                0L,
                0L
        );
    }

    public String generateReferralCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(REFERRAL_CODE_LENGTH);
            for (int i = 0; i < REFERRAL_CODE_LENGTH; i++) {
                sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            code = sb.toString();
        } while (userRepository.findByReferralCode(code).isPresent());
        return code;
    }
}
