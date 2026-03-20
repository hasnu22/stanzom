package com.stanzom.domain.prize;

import com.stanzom.domain.prize.dto.DailyPrizeDto;
import com.stanzom.domain.prize.dto.SubmitAddressRequest;
import com.stanzom.domain.sport.Sport;
import com.stanzom.domain.sport.SportRepository;
import com.stanzom.domain.user.User;
import com.stanzom.domain.user.UserRepository;
import com.stanzom.shared.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PrizeService {

    private final DailyPrizeRepository dailyPrizeRepository;
    private final PrizeDeliveryAddressRepository prizeDeliveryAddressRepository;
    private final SportRepository sportRepository;
    private final UserRepository userRepository;
    private final PrizeMapper prizeMapper;

    @Transactional(readOnly = true)
    public DailyPrizeDto getDailyPrize(LocalDate date, String sportSlug) {
        Sport sport = sportRepository.findBySlug(sportSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Sport", "slug", sportSlug));

        DailyPrize prize = dailyPrizeRepository.findByPrizeDateAndSportId(date, sport.getId())
                .orElseThrow(() -> new ResourceNotFoundException("DailyPrize", "date/sport", date + "/" + sportSlug));

        String winnerName = null;
        if (prize.getWinnerUserId() != null) {
            winnerName = userRepository.findById(prize.getWinnerUserId())
                    .map(User::getName)
                    .orElse("Unknown");
        }

        DailyPrizeDto dto = prizeMapper.toDto(prize);
        return new DailyPrizeDto(
                dto.id(),
                dto.eventId(),
                dto.sportId(),
                dto.winnerUserId(),
                winnerName,
                dto.pointsScored(),
                dto.predictionAccuracy(),
                dto.prizeDescription(),
                dto.status(),
                dto.prizeDate()
        );
    }

    public void submitAddress(UUID prizeId, UUID userId, SubmitAddressRequest request) {
        DailyPrize prize = dailyPrizeRepository.findById(prizeId)
                .orElseThrow(() -> new ResourceNotFoundException("DailyPrize", "id", prizeId));

        if (!prize.getWinnerUserId().equals(userId)) {
            throw new IllegalStateException("Only the prize winner can submit a delivery address");
        }

        prizeDeliveryAddressRepository.findByPrizeId(prizeId)
                .ifPresent(a -> {
                    throw new IllegalStateException("Delivery address already submitted for this prize");
                });

        PrizeDeliveryAddress address = PrizeDeliveryAddress.builder()
                .userId(userId)
                .prizeId(prizeId)
                .fullName(request.fullName())
                .mobileNumber(request.mobileNumber())
                .streetAddress(request.streetAddress())
                .city(request.city())
                .state(request.state())
                .pincode(request.pincode())
                .build();
        prizeDeliveryAddressRepository.save(address);
    }
}
