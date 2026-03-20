package com.stanzom.domain.prize;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyPrizeRepository extends JpaRepository<DailyPrize, UUID> {

    Optional<DailyPrize> findByPrizeDateAndSportId(LocalDate date, UUID sportId);

    List<DailyPrize> findByPrizeDate(LocalDate date);

    List<DailyPrize> findByWinnerUserId(UUID userId);
}
