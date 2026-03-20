package com.stanzom.domain.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByMobileNumber(String mobileNumber);

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByUsername(String username);

    Optional<User> findByReferralCode(String code);

    Page<User> findByCity(String city, Pageable pageable);

    Page<User> findByState(String state, Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY u.seasonPoints DESC")
    Page<User> findTopUsersBySeasonPoints(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.city = :city ORDER BY u.seasonPoints DESC")
    Page<User> findTopUsersBySeasonPointsInCity(@Param("city") String city, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.state = :state ORDER BY u.seasonPoints DESC")
    Page<User> findTopUsersBySeasonPointsInState(@Param("state") String state, Pageable pageable);
}
