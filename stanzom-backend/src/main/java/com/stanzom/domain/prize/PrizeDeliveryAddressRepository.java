package com.stanzom.domain.prize;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrizeDeliveryAddressRepository extends JpaRepository<PrizeDeliveryAddress, UUID> {

    Optional<PrizeDeliveryAddress> findByPrizeId(UUID prizeId);
}
