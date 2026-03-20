package com.stanzom.domain.reward;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, UUID> {

    List<Referral> findByReferrerId(UUID referrerId);

    Optional<Referral> findByReferredId(UUID referredId);

    long countByReferrerId(UUID referrerId);
}
