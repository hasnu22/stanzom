package com.stanzom.scheduler;

import com.stanzom.domain.event.Event;
import com.stanzom.domain.event.EventRepository;
import com.stanzom.domain.notification.NotificationService;
import com.stanzom.domain.prediction.UserPrediction;
import com.stanzom.domain.prediction.UserPredictionRepository;
import com.stanzom.domain.prize.DailyPrize;
import com.stanzom.domain.prize.DailyPrizeRepository;
import com.stanzom.domain.sport.SportRepository;
import com.stanzom.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyPrizeScheduler {

    private final UserPredictionRepository userPredictionRepository;
    private final DailyPrizeRepository dailyPrizeRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final SportRepository sportRepository;

    @Scheduled(cron = "0 59 23 * * *")
    @Transactional
    public void determineDailyWinner() {
        log.info("Starting daily prize determination...");
        LocalDate today = LocalDate.now();

        List<Event> completedEvents = eventRepository.findByStatus("COMPLETED");

        // Group completed events by sport
        Map<UUID, List<Event>> eventsBySport = completedEvents.stream()
                .filter(e -> e.getSport() != null)
                .collect(Collectors.groupingBy(e -> e.getSport().getId()));

        int prizesAwarded = 0;

        for (Map.Entry<UUID, List<Event>> entry : eventsBySport.entrySet()) {
            UUID sportId = entry.getKey();
            List<Event> sportEvents = entry.getValue();

            // Check if prize already awarded for this sport today
            Optional<DailyPrize> existingPrize = dailyPrizeRepository.findByPrizeDateAndSportId(today, sportId);
            if (existingPrize.isPresent()) {
                log.debug("Daily prize already awarded for sport {} on {}", sportId, today);
                continue;
            }

            // Aggregate points per user across all completed events for this sport
            Map<UUID, Integer> userPointsMap = new HashMap<>();
            Map<UUID, long[]> userAccuracyMap = new HashMap<>(); // [correct, total]

            for (Event event : sportEvents) {
                for (UserPrediction prediction : getAllPredictionsForEvent(event.getId())) {
                    UUID userId = prediction.getUserId();
                    userPointsMap.merge(userId, prediction.getPointsEarned(), Integer::sum);

                    long[] accuracy = userAccuracyMap.computeIfAbsent(userId, k -> new long[]{0, 0});
                    accuracy[1]++;
                    if (Boolean.TRUE.equals(prediction.getIsCorrect())) {
                        accuracy[0]++;
                    }
                }
            }

            if (userPointsMap.isEmpty()) {
                log.debug("No predictions found for sport {} on {}", sportId, today);
                continue;
            }

            // Find user with highest points
            UUID winnerId = userPointsMap.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);

            if (winnerId == null) {
                continue;
            }

            int winnerPoints = userPointsMap.get(winnerId);
            long[] winnerAccuracy = userAccuracyMap.getOrDefault(winnerId, new long[]{0, 1});
            BigDecimal accuracy = BigDecimal.valueOf(winnerAccuracy[0])
                    .divide(BigDecimal.valueOf(Math.max(winnerAccuracy[1], 1)), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            DailyPrize dailyPrize = DailyPrize.builder()
                    .eventId(sportEvents.get(0).getId())
                    .sportId(sportId)
                    .winnerUserId(winnerId)
                    .pointsScored(winnerPoints)
                    .predictionAccuracy(accuracy)
                    .prizeDescription("Daily prediction winner")
                    .status("PENDING")
                    .prizeDate(today)
                    .build();

            dailyPrizeRepository.save(dailyPrize);
            prizesAwarded++;

            // Send notification to the winner
            notificationService.sendNotification(
                    winnerId,
                    "You won today's prediction prize!",
                    "Congratulations! You scored " + winnerPoints + " points with " + accuracy + "% accuracy.",
                    "PRIZE_WON",
                    dailyPrize.getId().toString()
            );

            log.info("Daily prize awarded to user {} for sport {} with {} points", winnerId, sportId, winnerPoints);
        }

        log.info("Daily prize determination completed. {} prizes awarded.", prizesAwarded);
    }

    private List<UserPrediction> getAllPredictionsForEvent(UUID eventId) {
        return userPredictionRepository.findByEventId(eventId);
    }
}
